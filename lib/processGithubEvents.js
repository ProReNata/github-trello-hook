
const Trello = require('./Trello');

function extractGithubBranch(url){
	if (!url) return null;
	const match = url.match(/[^\/]+$/);
	return match && match[0];
}

function processMatch(match, commitUrl, branch, dipatcher){
	const action = match[1].toLowerCase();
	const cardId = match[2];

	Trello.getCard(cardId).then(card => {
		return Trello.getBoard(card.idBoard);
	}).then(board => {
		// check if commit branch and Trello board/branch are the same
		const check = new RegExp(branch + '$');
		const branchesDiff = board.url && !board.url.match(check);

		if (branch && branchesDiff && action != 'related') {
			return console.log(`Gitubs "${branch}" branch does not match Trello's ${board.url} board`);
		}

		// all good, make actions
		dipatcher({
			action: action,
			cardId: cardId,
			commitUrl: commitUrl
		});
	});
}

module.exports = function (event, dipatcher) {

	const githubBranch = extractGithubBranch(event.ref);
	if (githubBranch == 'production') return console.log('Production branch. Ignoring.');

	const commits = event.commits;
    if (!commits) return;
    const regex = /(fixes|related|fixed)[\s\n:]+https:\/\/Trello\.com\/c\/([\w\d]+)[\/\n\s]*/gi;
    for (let commit of commits) {
        let match = null;
        while (match = regex.exec(commit.message)) {
			processMatch(match, commit.url, githubBranch, dipatcher);
        }
    }
}
