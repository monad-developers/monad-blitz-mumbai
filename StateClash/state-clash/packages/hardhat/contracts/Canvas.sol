// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title Canvas
 * @notice A collaborative 50x50 pixel canvas that demonstrates Monad's
 *         Optimistic Parallel EVM by detecting same-block state collisions.
 */
contract Canvas {
    uint256 public constant GRID_SIZE = 50;

    struct Pixel {
        uint8 color;
        uint256 lastUpdateBlock;
        uint256 updatesInCurrentBlock;
    }

    /// @notice 1D mapping representing the 50x50 grid. pixelId = x*50 + y
    mapping(uint256 => Pixel) public canvas;

    /// @notice Emitted when a pixel is drawn with no same-block contention.
    event PixelUpdated(uint256 indexed pixelId, address indexed painter, uint8 color);

    /// @notice Emitted when two transactions touch the same pixel in one block.
    event StateCollision(uint256 indexed pixelId, address indexed painter, uint256 blockNumber);

    /**
     * @notice Paint a pixel on the canvas.
     * @param _x X coordinate (0-49)
     * @param _y Y coordinate (0-49)
     * @param _color Color index (0-255)
     */
    function drawPixel(uint256 _x, uint256 _y, uint8 _color) external {
        require(_x < GRID_SIZE, "X out of bounds");
        require(_y < GRID_SIZE, "Y out of bounds");

        uint256 pixelId = (_x * GRID_SIZE) + _y;
        Pixel storage px = canvas[pixelId];

        // Reset the block counter if we are in a new block
        if (px.lastUpdateBlock != block.number) {
            px.lastUpdateBlock = block.number;
            px.updatesInCurrentBlock = 0;
        }

        // If this exact pixel has already been updated in THIS block, it's a collision
        if (px.updatesInCurrentBlock > 0) {
            emit StateCollision(pixelId, msg.sender, block.number);
        } else {
            emit PixelUpdated(pixelId, msg.sender, _color);
        }

        px.color = _color;
        px.updatesInCurrentBlock += 1;
    }
}
