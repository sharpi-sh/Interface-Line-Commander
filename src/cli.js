export class CLI {
  constructor(game) {
    this.game = game;
    this.input = document.getElementById('command-input');
    this.commandHistory = [];
    this.historyIndex = -1;
    this.validCommands = new Set(['mine', 'stop', 'help', 'dead slow', 'full ahead', 'heading -n', 'heading -e', 'heading -w', 'heading -s']);
    this.commandDescriptions = {
      'mine': 'Drop a mine behind the ship',
      'stop': 'Gradually stop the ship',
      'ahead': 'Set ship speed (ahead -<number>) [1-10]',
      'full ahead': 'Full speed ahead',
      's': 'Set ship speed (s -<number>) [1-10]',
      'speed': 'Set ship speed (speed -<number>) [1-10]',
      'dead slow': 'Set speed to minimum (1)',
      'fire -p': 'Fire missile from port side',
      'fire -s': 'Fire missile from starboard side',
      'heading -n': 'Change heading to North',
      'heading -e': 'Change heading to East',
      'heading -w': 'Change heading to West',
      'heading -s': 'Change heading to South'
    };
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.input.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        const command = this.input.value.trim().toLowerCase();
        if (command) {
          const isValid = this.validCommands.has(command) || 
                         (command.startsWith('ahead -') && 
                          !isNaN(command.split('-')[1]) && 
                          parseInt(command.split('-')[1]) >= 1 && 
                          parseInt(command.split('-')[1]) <= 10) ||
                         ((command.startsWith('s -') || command.startsWith('speed -')) && 
                          !isNaN(command.split('-')[1]) && 
                          parseInt(command.split('-')[1]) >= 1 && 
                          parseInt(command.split('-')[1]) <= 10) ||
                         command === 'fire -p' ||
                         command === 'fire -s';
          this.commandHistory.push({ text: command, valid: isValid });
          this.historyIndex = -1;
          if (isValid) {
            this.handleCommand(command);
          }
          this.input.value = '';
          this.game.ui.updateCommandHistory(this.commandHistory);
        }
      }
    });

    this.input.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        this.input.setSelectionRange(this.input.value.length, this.input.value.length);
        this.input.style.color = '#18FF27';
      } else if (event.key === 'Escape') {
        this.historyIndex = -1;
        this.input.value = '';
        this.input.style.color = '#18FF27';
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (this.historyIndex < this.commandHistory.length - 1) {
          this.historyIndex++;
          this.input.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex].text;
          this.input.style.color = '#535353';
        }
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (this.historyIndex > -1) {
          this.historyIndex--;
          if (this.historyIndex === -1) {
            this.input.value = '';
          } else {
            this.input.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex].text;
          }
          this.input.style.color = '#535353';
        }
      } else if (event.key !== 'Enter') {
        this.historyIndex = -1;
        this.input.style.color = '#18FF27';
      }
    });
  }

  handleCommand(command) {
    if (this.game.ship.lives <= 0) return;
    
    if (command === 'help') {
      this.game.ui.showHelp(this.commandDescriptions);
      return;
    }
    
    if (command === 'mine') {
      this.game.dropMine();
      return;
    }

    if (command === 'stop') {
      this.game.ship.stop();
      return;
    }
    
    if (command === 'full ahead') {
      this.game.ship.setSpeed(this.game.ship.maxSpeed);
      return;
    }

    if (command === 'dead slow') {
      this.game.ship.setSpeed(1);
      return;
    }

    if (command === 'fire -p' || command === 'fire -s') {
      const side = command === 'fire -p' ? 'port' : 'starboard';
      this.game.fireMissile(side);
      return;
    }

    if (command.startsWith('heading -')) {
      const direction = command.split('-')[1];
      if (['n', 'e', 'w', 's'].includes(direction)) {
        const headings = {
          'n': 'north',
          'e': 'east',
          'w': 'west',
          's': 'south'
        };
        this.game.ship.setHeading(headings[direction]);
      }
      return;
    }

    if (command.startsWith('ahead -')) {
      const speed = parseInt(command.split('-')[1]);
      if (!isNaN(speed) && speed >= 1 && speed <= 10) {
        this.game.ship.setSpeed(speed);
      }
      return;
    }

    if (command.startsWith('s -') || command.startsWith('speed -')) {
      const speed = parseInt(command.split('-')[1]);
      if (!isNaN(speed) && speed >= 1 && speed <= 10) {
        this.game.ship.setSpeed(speed);
      }
    }
  }
}