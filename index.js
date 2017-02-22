
const http = require('http');
const Trello = require('./lib/Trello');
const processGithubEvents = require('./lib/processGithubEvents');
console.log('Node.js version: ', process.version); // just to be sure heroku is up-to-date

function routeAction(event){
	// move card
	if (event.action == 'fixes' || event.action == 'fixed') {
		Trello.markAsImplemented(event.cardId)
			.then(res => console.log(res))
			.catch(e => console.log(e));
	}
	// comment card
	const text = event.action == 'related' ? 'Related: ' : 'Fixed by: ';
	Trello.addCommentToCard(event.cardId, text + event.commitUrl)
		.then(res => console.log(res))
		.catch(e => console.log(e));
}

const server = http.createServer((req, res) => {
	let body = "";
	req.on('data', chunk => body += chunk);
	req.on('end', function () {
		try {
			const event = JSON.parse(body);
			processGithubEvents(event, routeAction);
		} catch (e) {
			console.log('Delivery failed!\nMessage:', e);
		}
		res.writeHead(200);
		res.end();
	});
});
server.on('clientError', (err, socket) => {
	socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(process.env.PORT || 8000);
