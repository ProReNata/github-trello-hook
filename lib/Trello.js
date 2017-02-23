const https = require('https');
const querystring = require('querystring');

class _Trello {
	constructor(key, token){
		this.authKey = key;
		this.authToken = token;
	}

	request(type, subPath, method, payload){
		let data = null;
		var options = {
			host: 'api.trello.com',
			path: `/1/${type}/${subPath}?key=${this.authKey}&token=${this.authToken}`,
			method: method,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		};
		if (payload) {
			data = querystring.stringify(payload);
			options.headers['Content-Length'] = Buffer.byteLength(data);
		}
		return new Promise((resolve, reject) => {
			const req = https.request(options, res => {
				let str = '';
				res.on('data', chunk => str+= chunk);
				res.on('end', () => {
					try {
						const json = JSON.parse(str);
						resolve(json);
					} catch (e) {
						reject(e + '\nMessage: ' + str);
					}
				});

			});
			req.on('error', reject);
			if (data) req.write(data);
			req.end();
		}).catch(e => console.log(e));
	}

	getOrgMembers(org){
		return this.request('organizations', `${org}/members`, 'GET');
	}

	getCard(id){
		return this.request('cards', id, 'GET');
	}

	getCardActions(id){
		return this.request('cards', `${id}/actions`, 'GET');
	}

	getBoard(id){
		return this.request('boards', id, 'GET');
	}

	getBoardLists(idBoard){
		return this.request('boards', `${idBoard}/lists`, 'GET');
	}

	moveCardTo(cardId, idList){
		return this.request('cards', `${cardId}/idList`, 'PUT', {value: idList});
	}

	markAsImplemented(cardId){
		return this.getCard(cardId).then(card => {
			return this.getBoardLists(card.idBoard);
		}).then(lists => {
			const implemented = lists.find(l => l.name.toLowerCase() == 'implemented');
			return this.moveCardTo(cardId, implemented.id);
		}).then(() => Promise.resolve(`Card ${cardId} moved!`));
	}

	addCommentToCard(cardId, text){
		return this.request('cards', `${cardId}/actions/comments`, 'POST', {
			text: text}
		).then(() => Promise.resolve(`Card ${cardId} received comment:\n${text}.\n`));
	}
}

const keys = require('../keys/keys');
const Trello = new _Trello(
	process.env.TRELLO_KEY || keys.TRELLO_KEY,
	process.env.TRELLO_TOKEN || keys.TRELLO_TOKEN
);

module.exports = Trello;
