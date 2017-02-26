
const Trello = require('./Trello');

function extractGithubBranch(url){
	if (!url) return null;
	const match = url.match(/[^\/]+$/);
	return match && match[0];
}

function processMatch(match, commitUrl, branch, dipatcher){
	const action = match[1].toLowerCase();
	const cardId = match[2];

	// check the car content first for duplicate comments
	// this will not work if coomit hash is different, we will check
	// these later on, checking if the card branch is same as github branch
	Trello.getCardActions(cardId).then(actions => {
		for (let comment of actions) {
			if (comment.type != 'commentCard') continue;
			if (comment.data.text.includes(commitUrl)) {
				return Promise.reject('Comment already present. Ignoring.');
			}
		}

		return Trello.getCard(cardId);
	}).then(card => {
		return Trello.getBoard(card.idBoard);
	}).then(board => {
		// check if commit branch and Trello board/branch are the same
		const check = new RegExp(branch + '$');
		const branchesDiff = board.url && !board.url.match(check);



		if (branch && branchesDiff) {
			return console.log(`Gitubs "${branch}" branch does not match Trello's ${board.url} board`);
		}

		// all good, make actions
		dipatcher({
			action: action,
			cardId: cardId,
			commitUrl: commitUrl
		});
	}).catch(e => console.log(e));
}

module.exports = function (event, dipatcher) {

	const githubBranch = extractGithubBranch(event.ref);
	if (githubBranch == 'production') return console.log('Production branch. Ignoring.');

	const commits = event.commits;
    if (!commits) return;
    const regex = /(fixes|related|fixed)[\s\n:\w]{0,5}https:\/\/Trello\.com\/c\/([\w\d]+)[\/\n\s]*/gi;
    for (let commit of commits) {
        let match = null;
        while (match = regex.exec(commit.message)) {
			processMatch(match, commit.url, githubBranch, dipatcher);
        }
    }
}
