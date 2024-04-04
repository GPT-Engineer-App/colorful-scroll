import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Flex, Heading, Image, Progress, Text, VStack } from "@chakra-ui/react";
import { FaPlay, FaPause, FaUndo } from "react-icons/fa";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 50;
const ENEMY_SIZE = 40;
const POWERUP_SIZE = 30;
const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const MOVE_SPEED = 5;
const ENEMY_SPEED = 2;
const LEVEL_COUNT = 3;

const Index = () => {
  const [gameState, setGameState] = useState("start");
  const [player, setPlayer] = useState({ x: 50, y: GAME_HEIGHT - PLAYER_SIZE, vx: 0, vy: 0 });
  const [enemies, setEnemies] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [jumpCount, setJumpCount] = useState(0);
  const gameRef = useRef(null);

  useEffect(() => {
    const gameLoop = () => {
      if (gameState === "playing") {
        updatePlayer();
        updateEnemies();
        checkCollisions();
      }
      requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }, [gameState]);

  const startGame = () => {
    setGameState("playing");
    setPlayer({ x: 50, y: GAME_HEIGHT - PLAYER_SIZE, vx: 0, vy: 0 });
    setEnemies(generateEnemies());
    setPowerUps(generatePowerUps());
    setLevel(1);
    setScore(0);
    setLives(3);
    setJumpCount(0);
  };

  const pauseGame = () => {
    setGameState(gameState === "paused" ? "playing" : "paused");
  };

  const resetGame = () => {
    setGameState("start");
  };

  const updatePlayer = () => {
    let { x, y, vx, vy } = player;
    vy += GRAVITY;
    x += vx;
    y += vy;

    if (y > GAME_HEIGHT - PLAYER_SIZE) {
      y = GAME_HEIGHT - PLAYER_SIZE;
      vy = 0;
      setJumpCount(0);
    }

    if (x < 0) {
      x = 0;
    } else if (x > GAME_WIDTH - PLAYER_SIZE) {
      x = GAME_WIDTH - PLAYER_SIZE;
    }

    setPlayer({ x, y, vx, vy });
  };

  const updateEnemies = () => {
    setEnemies((prevEnemies) =>
      prevEnemies.map((enemy) => ({
        ...enemy,
        x: enemy.x - ENEMY_SPEED,
      })),
    );
  };

  const checkCollisions = () => {
    enemies.forEach((enemy, index) => {
      if (player.x < enemy.x + ENEMY_SIZE && player.x + PLAYER_SIZE > enemy.x && player.y < enemy.y + ENEMY_SIZE && player.y + PLAYER_SIZE > enemy.y) {
        setLives((prevLives) => prevLives - 1);
        setEnemies((prevEnemies) => prevEnemies.filter((_, i) => i !== index));
      }
    });

    powerUps.forEach((powerUp, index) => {
      if (player.x < powerUp.x + POWERUP_SIZE && player.x + PLAYER_SIZE > powerUp.x && player.y < powerUp.y + POWERUP_SIZE && player.y + PLAYER_SIZE > powerUp.y) {
        setScore((prevScore) => prevScore + 10);
        setPowerUps((prevPowerUps) => prevPowerUps.filter((_, i) => i !== index));
      }
    });

    if (enemies.length === 0 && powerUps.length === 0) {
      if (level < LEVEL_COUNT) {
        setLevel((prevLevel) => prevLevel + 1);
        setEnemies(generateEnemies());
        setPowerUps(generatePowerUps());
      } else {
        setGameState("win");
      }
    }

    if (lives === 0) {
      setGameState("gameOver");
    }
  };

  const handleKeyDown = (event) => {
    if (event.code === "ArrowLeft") {
      setPlayer((prevPlayer) => ({ ...prevPlayer, vx: -MOVE_SPEED }));
    } else if (event.code === "ArrowRight") {
      setPlayer((prevPlayer) => ({ ...prevPlayer, vx: MOVE_SPEED }));
    } else if (event.code === "Space" && jumpCount < 2) {
      setPlayer((prevPlayer) => ({ ...prevPlayer, vy: JUMP_FORCE }));
      setJumpCount((prevJumpCount) => prevJumpCount + 1);
    }
  };

  const handleKeyUp = (event) => {
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
      setPlayer((prevPlayer) => ({ ...prevPlayer, vx: 0 }));
    }
  };

  const generateEnemies = () => {
    const enemies = [];
    for (let i = 0; i < level * 2; i++) {
      const x = GAME_WIDTH + i * 200;
      const y = GAME_HEIGHT - ENEMY_SIZE;
      enemies.push({ x, y });
    }
    return enemies;
  };

  const generatePowerUps = () => {
    const powerUps = [];
    for (let i = 0; i < level; i++) {
      const x = GAME_WIDTH + i * 300;
      const y = Math.random() * (GAME_HEIGHT - POWERUP_SIZE);
      powerUps.push({ x, y });
    }
    return powerUps;
  };

  return (
    <VStack spacing={4} align="center">
      <Heading>Super Mario-inspired Platformer</Heading>
      <Box ref={gameRef} position="relative" width={GAME_WIDTH} height={GAME_HEIGHT} borderWidth={2} borderColor="gray.200" overflow="hidden" tabIndex={0} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
        {gameState === "start" && (
          <Flex position="absolute" top={0} left={0} width="100%" height="100%" alignItems="center" justifyContent="center" bg="rgba(0, 0, 0, 0.7)" zIndex={1}>
            <VStack spacing={4}>
              <Heading color="white">Start Game</Heading>
              <Button leftIcon={<FaPlay />} onClick={startGame}>
                Play
              </Button>
            </VStack>
          </Flex>
        )}
        {gameState === "paused" && (
          <Flex position="absolute" top={0} left={0} width="100%" height="100%" alignItems="center" justifyContent="center" bg="rgba(0, 0, 0, 0.7)" zIndex={1}>
            <VStack spacing={4}>
              <Heading color="white">Game Paused</Heading>
              <Button leftIcon={<FaPlay />} onClick={pauseGame}>
                Resume
              </Button>
            </VStack>
          </Flex>
        )}
        {gameState === "gameOver" && (
          <Flex position="absolute" top={0} left={0} width="100%" height="100%" alignItems="center" justifyContent="center" bg="rgba(0, 0, 0, 0.7)" zIndex={1}>
            <VStack spacing={4}>
              <Heading color="white">Game Over</Heading>
              <Text color="white">Score: {score}</Text>
              <Button leftIcon={<FaUndo />} onClick={resetGame}>
                Play Again
              </Button>
            </VStack>
          </Flex>
        )}
        {gameState === "win" && (
          <Flex position="absolute" top={0} left={0} width="100%" height="100%" alignItems="center" justifyContent="center" bg="rgba(0, 0, 0, 0.7)" zIndex={1}>
            <VStack spacing={4}>
              <Heading color="white">You Win!</Heading>
              <Text color="white">Score: {score}</Text>
              <Button leftIcon={<FaUndo />} onClick={resetGame}>
                Play Again
              </Button>
            </VStack>
          </Flex>
        )}
        <Image position="absolute" left={player.x} top={player.y} src="https://images.unsplash.com/photo-1677763831310-fba42fc109e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDcxMzJ8MHwxfHNlYXJjaHwxfHxtYXJpbyUyMGNoYXJhY3RlcnxlbnwwfHx8fDE3MTIyNDczNTN8MA&ixlib=rb-4.0.3&q=80&w=1080" alt="Player" boxSize={`${PLAYER_SIZE}px`} />
        {enemies.map((enemy, index) => (
          <Image key={index} position="absolute" left={enemy.x} top={enemy.y} src="https://images.unsplash.com/photo-1646640237345-0c72cd23045a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDcxMzJ8MHwxfHNlYXJjaHwxfHxnb29tYmElMjBlbmVteXxlbnwwfHx8fDE3MTIyNDczNTR8MA&ixlib=rb-4.0.3&q=80&w=1080" alt="Enemy" boxSize={`${ENEMY_SIZE}px`} />
        ))}
        {powerUps.map((powerUp, index) => (
          <Image key={index} position="absolute" left={powerUp.x} top={powerUp.y} src="https://images.unsplash.com/photo-1527896573815-b7dd74893deb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDcxMzJ8MHwxfHNlYXJjaHwxfHxzdXBlciUyMG11c2hyb29tJTIwcG93ZXItdXB8ZW58MHx8fHwxNzEyMjQ3MzU0fDA&ixlib=rb-4.0.3&q=80&w=1080" alt="Power-Up" boxSize={`${POWERUP_SIZE}px`} />
        ))}
      </Box>
      <Flex width="100%" justifyContent="space-between" alignItems="center">
        <Text>Lives: {lives}</Text>
        <Text>Score: {score}</Text>
        <Text>Level: {level}</Text>
      </Flex>
      <Progress value={(level / LEVEL_COUNT) * 100} width="100%" />
      <Flex>
        <Button leftIcon={<FaPlay />} onClick={startGame} disabled={gameState === "playing"}>
          Start
        </Button>
        <Button leftIcon={<FaPause />} onClick={pauseGame} disabled={gameState !== "playing"}>
          Pause
        </Button>
      </Flex>
    </VStack>
  );
};

export default Index;
