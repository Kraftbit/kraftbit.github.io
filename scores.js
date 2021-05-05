// create and update browser local storage
window.scoreStore = {
	// players data
	players: JSON.parse(localStorage.getItem('score-store') || '[]'),

	//save / update data
	save() {
		this.players.sort(function (a, b) {
			return parseFloat(b.percentage) - parseFloat(a.percentage);
		}),

			localStorage.setItem('score-store', JSON.stringify(this.players));
	}
};

// main game functionality
window.game = function () {
	return {

		// import local storage data
		...scoreStore,

		// new player name
		newPlayer: '',

		//editing player
		editedPlayer: null,

		// first selected player
		firstPlayer: null,
		get playerOne() {
			return this.players.find(obj => obj.id === parseInt(this.firstPlayer));
		},

		// second selected player
		secondPlayer : null,
		get playerTwo() {
			return this.players.find(obj => obj.id === parseInt(this.secondPlayer));
		},

		//game options
		options : {
			rounds: 5,
			margin: 2,
			get roundsForWin() {
				return this.rounds;
			},
			get marginForWin() {
				return this.margin;
			},
			set roundsForWin(rounds) {
				this.rounds = parseInt(rounds);
			},
			set marginForWin(margin) {
				this.margin = parseInt(margin);
			}
		},

		// current round score data
		currentRoundScore: {
			first: 0,
			second: 0,
			get firstScore() {
				return this.first;
			},
			get secondScore() {
				return this.second;
			},
			set firstScore(score) {
				this.first = parseInt(score);
			},
			set secondScore(score) {
				this.second = parseInt(score);
			}
		},

		// create new player
		addPlayer() {
			if (!this.newPlayer) {
				return;
			}
			this.players.push({
				id: Date.now(),
				name: this.newPlayer,
				games: 0,
				wins: 0,
				percentage: 0.000,
			});

			this.save();

			this.newPlayer = '';
		},

		// edit player name
		editPlayer(player) {
			player.cachedName = player.name;
			this.editedPlayer = player;
		},

		// complete player editing
		editComplete(player) {
			if (player.name === '') {
				return this.deletePlayer(player);
			}

			this.editedPlayer = null;
			this.save();

			flash({
				text: 'Player updated',
				type: 'success'
			});
		},

		// delete player
		deletePlayer(player) {
			let position = this.players.indexOf(player);
			this.players.splice(position, 1);

			this.save();

			flash({
				text: 'Player deleted!',
				type: 'failure'
			});
		},

		// check if winning criteria are met 
		checkScores() {
			if ( (this.currentRoundScore.first >= this.options.rounds) 
				&& (this.currentRoundScore.first - this.currentRoundScore.second) >= this.options.margin ) {
				return this.declareWinner(this.playerOne, this.playerTwo);
			}
			
			if( (this.currentRoundScore.second >= this.options.rounds) 
			&& (this.currentRoundScore.second - this.currentRoundScore.first) >= this.options.margin ) {
				return this.declareWinner(this.playerTwo, this.playerOne);
			}
		},

		// save winner and loser game data
		async declareWinner(winner, loser) {
			flash({
				text: winner.name + ' won the round!',
				type: 'success'
			});

			await pause();

			winner.games++;
			winner.wins++;
			this.calculatePercentage(winner);
			
			loser.games++;
			this.calculatePercentage(loser);

			this.save();
			
			this.resetCurrentRoundScore();

		},

		// calculate player winning percentage data
		calculatePercentage(player) {
			player.percentage = (parseFloat(player.wins) / parseFloat(player.games)).toFixed(3);
		},

		// reset current round score
		resetCurrentRoundScore() {
			this.currentRoundScore.first = 0;
			this.currentRoundScore.second = 0;
		}
	}
}

// pop up flash messages
window.flash = function (message) {
	window.dispatchEvent(new CustomEvent('flash', {
		detail: { message }
	}));
}

// pause execution for 1s
window.pause = function (milliseconds = 1000) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}