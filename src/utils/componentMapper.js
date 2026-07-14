// Mapping of game and utility component types to their respective Vue components

import SokobanGame from '../components/games/SokobanGame.vue'
import ImageEditor from '../components/image/ImageEditor.vue'
import MusicPlayer from '../components/MusicPlayer.vue'
import DyForm from '../views/DyForm.vue'
import FruitCatcher from '../components/games/FruitCatcher.vue'
import BattleCityGame from '../components/games/BattleCityGame.vue'
import BrickBreakerGame from '../components/games/BrickBreakerGame.vue'
import FlappyBirdGame from '../components/games/FlappyBirdGame.vue'
import SpaceShooterGame from '../components/games/SpaceShooterGame.vue'
import SnakeGame from '../components/games/SnakeGame.vue'
import TetrisGame from '../components/games/TetrisGame.vue'
import Game2048 from '../components/games/Game2048.vue'
import MinesweeperGame from '../components/games/MinesweeperGame.vue'
import TicTacToeGame from '../components/games/TicTacToeGame.vue'
import QiteTodo from '../components/games/QiteTodo.vue'
import DeveloperToolbox from '../components/games/DeveloperToolbox.vue'

export const COMPONENT_MAP = {
  game: SokobanGame,
  image: ImageEditor,
  video: MusicPlayer,
  dyform: DyForm,
  fruitgame: FruitCatcher,
  battlecity: BattleCityGame,
  brickbreaker: BrickBreakerGame,
  flappybird: FlappyBirdGame,
  spaceshooter: SpaceShooterGame,
  snake: SnakeGame,
  tetris: TetrisGame,
  game2048: Game2048,
  minesweeper: MinesweeperGame,
  tictactoe: TicTacToeGame,
  qitetodo: QiteTodo,
  devtools: DeveloperToolbox
}

export function getComponentByType(type) {
  return COMPONENT_MAP[type] || null
}
