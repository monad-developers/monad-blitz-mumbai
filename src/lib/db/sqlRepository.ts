import type {
  Doctrine,
  Event,
  Feedback,
  Ideology,
  Infection,
  Prediction,
  Prophet,
  Schism,
} from "../types/contracts";
import type { DataRepository, IdeologyMetrics } from "./repository";
import { getSqlClient } from "./neon";

type Row = Record<string, unknown>;

function numberOrZero(value: unknown): number {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

export class SqlRepository implements DataRepository {
  private sql = getSqlClient();

  async upsertIdeology(ideology: Ideology): Promise<void> {
    await this.sql`
      INSERT INTO ideologies (id, name, theme, founder_prophet_id, doctrine, doctrine_version, followers, reputation, treasury)
      VALUES (${ideology.id}, ${ideology.name}, ${ideology.theme}, ${ideology.founderProphetId}, ${ideology.doctrine}, ${ideology.doctrineVersion}, ${ideology.followers}, ${ideology.reputation}, ${ideology.treasury})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        theme = EXCLUDED.theme,
        founder_prophet_id = EXCLUDED.founder_prophet_id,
        doctrine = EXCLUDED.doctrine,
        doctrine_version = EXCLUDED.doctrine_version,
        followers = EXCLUDED.followers,
        reputation = EXCLUDED.reputation,
        treasury = EXCLUDED.treasury
    `;
  }

  async upsertProphet(prophet: Prophet): Promise<void> {
    await this.sql`
      INSERT INTO prophets (id, ideology_id, personality, history, goal, special_ability, erc8004_token_id)
      VALUES (${prophet.id}, ${prophet.ideologyId}, ${prophet.personality}, ${prophet.history}, ${prophet.goal}, ${prophet.specialAbility}, ${prophet.erc8004TokenId})
      ON CONFLICT (id) DO UPDATE SET
        ideology_id = EXCLUDED.ideology_id,
        personality = EXCLUDED.personality,
        history = EXCLUDED.history,
        goal = EXCLUDED.goal,
        special_ability = EXCLUDED.special_ability,
        erc8004_token_id = EXCLUDED.erc8004_token_id
    `;
  }

  async insertDoctrineVersion(doctrine: Doctrine): Promise<void> {
    await this.sql`
      INSERT INTO doctrine_versions (ideology_id, version, text, reason, created_at)
      VALUES (${doctrine.ideologyId}, ${doctrine.version}, ${doctrine.text}, ${doctrine.reason}, ${doctrine.timestamp})
    `;
  }

  async insertEvent(event: Event): Promise<void> {
    await this.sql`
      INSERT INTO events (type, ideology_id, payload, created_at)
      VALUES (${event.type}, ${event.ideologyId}, ${JSON.stringify(event.payload)}, ${event.timestamp})
    `;
  }

  async listIdeologies(): Promise<Ideology[]> {
    const rows = (await this.sql`
      SELECT id, name, theme, founder_prophet_id, doctrine, doctrine_version, followers, reputation, treasury
      FROM ideologies
    `) as Row[];

    return rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      theme: String(row.theme),
      founderProphetId: String(row.founder_prophet_id),
      doctrine: String(row.doctrine),
      doctrineVersion: numberOrZero(row.doctrine_version),
      followers: numberOrZero(row.followers),
      reputation: numberOrZero(row.reputation),
      treasury: numberOrZero(row.treasury),
    }));
  }

  async listProphetsByIdeology(ideologyId: string): Promise<Prophet[]> {
    const rows = (await this.sql`
      SELECT id, ideology_id, personality, history, goal, special_ability, erc8004_token_id
      FROM prophets
      WHERE ideology_id = ${ideologyId}
    `) as Row[];

    return rows.map((row) => ({
      id: String(row.id),
      ideologyId: String(row.ideology_id),
      personality: String(row.personality),
      history: String(row.history),
      goal: String(row.goal),
      specialAbility: String(row.special_ability) as Prophet["specialAbility"],
      erc8004TokenId: row.erc8004_token_id ? String(row.erc8004_token_id) : null,
    }));
  }

  async getIdeologyMetrics(ideologyId: string): Promise<IdeologyMetrics> {
    const ideologyRows = (await this.sql`
      SELECT id, name, theme, founder_prophet_id, doctrine, doctrine_version, followers, reputation, treasury
      FROM ideologies
      WHERE id = ${ideologyId}
      LIMIT 1
    `) as Row[];

    if (!ideologyRows[0]) {
      throw new Error(`Ideology not found: ${ideologyId}`);
    }

    const [feedbackRows, eventRows] = await Promise.all([
      this.sql`
        SELECT ideology_id, user_id, text, created_at
        FROM feedback
        WHERE ideology_id = ${ideologyId}
        ORDER BY created_at DESC
        LIMIT 100
      `,
      this.sql`
        SELECT type, ideology_id, payload, created_at
        FROM events
        WHERE ideology_id = ${ideologyId}
        ORDER BY created_at DESC
        LIMIT 25
      `,
    ]);

    const ideologyRow = ideologyRows[0];

    const ideology: Ideology = {
      id: String(ideologyRow.id),
      name: String(ideologyRow.name),
      theme: String(ideologyRow.theme),
      founderProphetId: String(ideologyRow.founder_prophet_id),
      doctrine: String(ideologyRow.doctrine),
      doctrineVersion: numberOrZero(ideologyRow.doctrine_version),
      followers: numberOrZero(ideologyRow.followers),
      reputation: numberOrZero(ideologyRow.reputation),
      treasury: numberOrZero(ideologyRow.treasury),
    };

    const criticismTexts = (feedbackRows as Row[]).map((row) => String(row.text));

    const recentEvents: Event[] = (eventRows as Row[]).map((row) => ({
      type: String(row.type) as Event["type"],
      ideologyId: String(row.ideology_id),
      payload:
        typeof row.payload === "object" && row.payload
          ? (row.payload as Record<string, unknown>)
          : {},
      timestamp: new Date(String(row.created_at)).toISOString(),
    }));

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const joinCount = recentEvents.filter(
      (event) =>
        event.type === "join" &&
        Number(new Date(event.timestamp).getTime()) >= sevenDaysAgo,
    ).length;

    return {
      ideology,
      followerGrowth: joinCount,
      criticismTexts,
      recentEvents,
    };
  }

  async updateIdeologyDoctrine(
    ideologyId: string,
    doctrine: string,
    doctrineVersion: number,
  ): Promise<void> {
    await this.sql`
      UPDATE ideologies
      SET doctrine = ${doctrine}, doctrine_version = ${doctrineVersion}
      WHERE id = ${ideologyId}
    `;
  }

  async updateIdeologyFollowers(
    ideologyId: string,
    followers: number,
  ): Promise<void> {
    await this.sql`
      UPDATE ideologies
      SET followers = ${followers}
      WHERE id = ${ideologyId}
    `;
  }

  async insertSchism(schism: Schism): Promise<void> {
    await this.sql`
      INSERT INTO schisms (parent_ideology_id, new_ideology_id, justification, created_at)
      VALUES (${schism.parentIdeologyId}, ${schism.newIdeologyId}, ${schism.justification}, ${schism.timestamp})
    `;
  }

  async upsertPrediction(prediction: Prediction): Promise<void> {
    await this.sql`
      INSERT INTO predictions (prophet_id, conversation_id, prediction_text, trigger_keyword, status, created_at)
      VALUES (${prediction.prophetId}, ${prediction.conversationId}, ${prediction.predictionText}, ${prediction.triggerKeyword}, ${prediction.status}, ${prediction.createdAt})
      ON CONFLICT (prophet_id, conversation_id, trigger_keyword) DO UPDATE SET
        prediction_text = EXCLUDED.prediction_text,
        status = EXCLUDED.status
    `;
  }

  async listPendingPredictions(
    prophetId: string,
    conversationId: string,
  ): Promise<Prediction[]> {
    const rows = (await this.sql`
      SELECT prophet_id, conversation_id, prediction_text, trigger_keyword, status, created_at
      FROM predictions
      WHERE prophet_id = ${prophetId} AND conversation_id = ${conversationId} AND status = 'pending'
      ORDER BY created_at ASC
    `) as Row[];

    return rows.map((row) => ({
      prophetId: String(row.prophet_id),
      conversationId: String(row.conversation_id),
      predictionText: String(row.prediction_text),
      triggerKeyword: String(row.trigger_keyword),
      status: String(row.status) as Prediction["status"],
      createdAt: new Date(String(row.created_at)).toISOString(),
    }));
  }

  async markPredictionFulfilled(
    prophetId: string,
    conversationId: string,
    triggerKeyword: string,
  ): Promise<void> {
    await this.sql`
      UPDATE predictions
      SET status = 'fulfilled'
      WHERE prophet_id = ${prophetId} AND conversation_id = ${conversationId} AND trigger_keyword = ${triggerKeyword}
    `;
  }

  async getInfection(
    conversationId: string,
    prophetId: string,
  ): Promise<Infection | null> {
    const rows = (await this.sql`
      SELECT conversation_id, prophet_id, level, status, updated_at
      FROM infections
      WHERE conversation_id = ${conversationId} AND prophet_id = ${prophetId}
      LIMIT 1
    `) as Row[];

    if (!rows[0]) {
      return null;
    }

    const row = rows[0];
    return {
      conversationId: String(row.conversation_id),
      prophetId: String(row.prophet_id),
      level: numberOrZero(row.level),
      status: String(row.status) as Infection["status"],
      updatedAt: new Date(String(row.updated_at)).toISOString(),
    };
  }

  async upsertInfection(infection: Infection): Promise<void> {
    await this.sql`
      INSERT INTO infections (conversation_id, prophet_id, level, status, updated_at)
      VALUES (${infection.conversationId}, ${infection.prophetId}, ${infection.level}, ${infection.status}, ${infection.updatedAt})
      ON CONFLICT (conversation_id, prophet_id) DO UPDATE SET
        level = EXCLUDED.level,
        status = EXCLUDED.status,
        updated_at = EXCLUDED.updated_at
    `;
  }

  async listFeedbackByIdeology(ideologyId: string): Promise<Feedback[]> {
    const rows = (await this.sql`
      SELECT ideology_id, user_id, text, created_at
      FROM feedback
      WHERE ideology_id = ${ideologyId}
      ORDER BY created_at DESC
      LIMIT 100
    `) as Row[];

    return rows.map((row) => ({
      ideologyId: String(row.ideology_id),
      userId: String(row.user_id),
      text: String(row.text),
      timestamp: new Date(String(row.created_at)).toISOString(),
    }));
  }
}
