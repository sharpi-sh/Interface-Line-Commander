import { Modal } from './modals/modal.js';
import { asciiArt } from './modals/asciiwelcome.js';

export class UI {
  constructor(game) {
    this.game = game;
    this.container = document.createElement('div');
    this.container.id = 'game-container';
    document.getElementById('app').appendChild(this.container);
    
    this.sidebar = document.createElement('div');
    this.sidebar.id = 'sidebar';
    this.container.appendChild(this.sidebar);
    
    this.commandPalette = document.createElement('div');
    this.commandPalette.id = 'command-palette';
    this.container.appendChild(this.commandPalette);
    
    this.gridContainer = document.createElement('div');
    this.gridContainer.id = 'grid-container';
    this.container.appendChild(this.gridContainer);
    
    this.commandWrapper = document.createElement('div');
    this.commandWrapper.id = 'command-wrapper';
    
    this.commandHeader = document.createElement('div');
    this.commandHeader.id = 'command-header';
    this.commandHeader.innerHTML = `
      <div class="command-title">Command Terminal</div>
      <div class="command-help-text">type help for commands</div>
    `;
    this.commandWrapper.appendChild(this.commandHeader);
    
    this.commandInputWrapper = document.createElement('div');
    this.commandInputWrapper.id = 'command-input-wrapper';
    
    this.commandLabel = document.createElement('span');
    this.commandLabel.id = 'command-label';
    this.commandLabel.textContent = '$';
    this.commandInputWrapper.appendChild(this.commandLabel);
    
    this.commandInput = document.createElement('input');
    this.commandInput.id = 'command-input';
    this.commandInput.type = 'text';
    this.commandInputWrapper.appendChild(this.commandInput);
    
    this.commandWrapper.appendChild(this.commandInputWrapper);
    
    this.container.appendChild(this.commandWrapper);
    
    this.cells = new Map();
    
    this.commandInput.focus();

    // Initialize modal
    this.modal = new Modal(this.gridContainer);

    // Initialize sidebar structure
    this.initializeSidebar();
  }

  initializeSidebar() {
    // Create ship info section
    const shipInfo = document.createElement('div');
    shipInfo.className = 'ship-info';
    this.sidebar.appendChild(shipInfo);

    // Create command history section
    const commandHistory = document.createElement('div');
    commandHistory.className = 'command-history';
    commandHistory.innerHTML = '<h3>Command History</h3>';
    this.sidebar.appendChild(commandHistory);

    // Create restart button
    const restartButton = document.createElement('button');
    restartButton.id = 'restart-button';
    restartButton.className = 'restart-button';
    restartButton.textContent = 'Restart Game';
    restartButton.addEventListener('click', () => {
      this.modal.show(
        'Confirm Restart',
        'Are you sure you want to restart the game?',
        'Yes, restart'
      ).then(() => {
        window.location.reload();
      });
    });
    this.sidebar.appendChild(restartButton);
  }

  createGrid(grid) {
    this.gridContainer.innerHTML = '';
    this.gridContainer.style.display = 'grid';
    this.gridContainer.style.gridTemplateColumns = `repeat(${grid.width}, 1fr)`;
    this.gridContainer.style.gap = '1px';
    this.gridContainer.style.backgroundColor = '#232323';
    this.gridContainer.style.padding = '1px';
    
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.x = x;
        cell.dataset.y = y;
        this.gridContainer.appendChild(cell);
        this.cells.set(`${x},${y}`, cell);
      }
    }

    // Show welcome modal after grid is created
    requestAnimationFrame(() => {
      this.modal.show('INTERFACE LINE\nCOMMANDER', asciiArt, 'To the fleet!');
    });
  }

  clearGrid() {
    this.cells.forEach(cell => {
      cell.style.backgroundColor = '#000000';
      cell.style.zIndex = '0';
    });
  }

  renderSprite(sprite, zIndex = 1) {
    sprite.segments.forEach(segment => {
      const cell = this.cells.get(`${Math.floor(segment.x)},${Math.floor(segment.y)}`);
      if (cell) {
        cell.style.backgroundColor = segment.color || sprite.color;
        cell.style.zIndex = zIndex.toString();
      }
    });
  }

  render(ship, submarine, missiles, explosions = [], mines = []) {
    this.clearGrid();
    
    // Check if submarine was just destroyed
    if (submarine.lives <= 0 && !this.victoryShown) {
      this.modal.show('Victory', 'Enemy submarine destroyed!');
      this.victoryShown = true;
    }

    // Check if ship was just destroyed
    if (ship.lives <= 0 && !this.defeatShown) {
      this.modal.show('Defeat', 'Your ship has been destroyed!');
      this.defeatShown = true;
    }
    
    // Render in order of z-index (bottom to top)
    this.renderSprite(submarine, 1); // Submarine at bottom
    mines.forEach(mine => this.renderSprite(mine, 2)); // Mines above submarine
    this.renderSprite(ship, 3); // Ship above mines
    missiles.forEach(missile => this.renderSprite(missile, 4)); // Missiles above ship
    explosions.forEach(explosion => this.renderSprite(explosion, 5)); // Explosions on top
    
    this.updateShipInfo(ship);
    
    if (!this.commandPalette.querySelector('.help-content')) {
      this.commandPalette.innerHTML = `
        <div class="submarine-status">
          <h3>Enemy Sub</h3>
          <div class="health-blocks">${Array(submarine.maxLives)
            .fill(0)
            .map((_, i) => `<div class="health-block ${i < submarine.lives ? 'active' : ''}"></div>`)
            .join('')}
        </div>
      </div>`;
    }
  }

  updateShipInfo(ship) {
    const shipInfo = this.sidebar.querySelector('.ship-info');
    if (shipInfo) {
      shipInfo.innerHTML = `
        <div class="ship-name">${ship.name}</div>
        <div class="ship-stats">
          <div>Speed: ${ship.speed.toFixed(1)} / ${ship.maxSpeed}</div>
          <div>Heading: ${ship.heading.charAt(0).toUpperCase() + ship.heading.slice(1)}</div>
        </div>
        <div class="health-blocks">${Array(ship.maxLives)
          .fill(0)
          .map((_, i) => `<div class="health-block ${i < ship.lives ? 'active' : ''}"></div>`)
          .join('')}
        </div>
        <div class="score">Score: ${ship.score}</div>
      `;
    }
  }

  showHelp(commandDescriptions) {
    const submarineInfo = `
      <div class="submarine-status">
        <h3>Enemy Sub</h3>
        <div class="health-blocks">${Array(this.game.submarine.maxLives)
          .fill(0)
          .map((_, i) => `<div class="health-block ${i < this.game.submarine.lives ? 'active' : ''}"></div>`)
          .join('')}
        </div>
      </div>
    `;

    this.commandPalette.innerHTML = `
      ${submarineInfo}
      <div class="help-content">
        <h3>Available Commands</h3>
        ${Object.entries(commandDescriptions).map(([cmd, desc]) => `
          <div class="help-entry">
            <span class="help-command">${cmd}</span>
            <span class="help-description">${desc}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  updateCommandHistory(history) {
    const commandHistoryElement = this.sidebar.querySelector('.command-history');
    if (commandHistoryElement) {
      commandHistoryElement.innerHTML = `
        <h3>Command History</h3>
        ${history.map(cmd => `
          <div class="command-entry">
            <span style="color: ${cmd.valid ? '#18FF27' : '#FF0000'}">$</span>
            <span style="color: ${cmd.valid ? '#18FF27' : '#46793E'}">${cmd.text}</span>
          </div>
        `).join('')}
      `;
    }
  }
}