
const processGithubEvents = require('../lib/processGithubEvents');

const commits = [
	{
		message: "Some line breaks\n\nFixes:\nhttps://trello.com/c/EPJ8UQb7/10-some-nice-title\nthat-is-long-and-breaks-line",
		url: "https://github.com/OrgName/ProjectName/commit/a1"
	},
	{
		message: "Some nice descrition.\n\nfixes: https://trello.com/c/EPJ8UQb7 and some more text",
		url: "https://github.com/OrgName/ProjectName/commit/a2"
	},
	{
		message: "Some nice descrition.\n\nrelated: https://trello.com/c/EPJ8UQb7 and some more text",
		url: "https://github.com/OrgName/ProjectName/commit/a3"
	},
	{
		message: "A description with no Trello stuff",
		"url": "https://github.com/OrgName/ProjectName/commit/a4"
	},
	{
		message: "A description ending with the ID\n\nfixes: https://trello.com/c/EPJ8UQb7",
		"url": "https://github.com/OrgName/ProjectName/commit/a4"
	},
	{
		message: "Some nice descrition.\n\nfixed https://trello.com/c/EPJ8UQb7 and some more text",
		url: "https://github.com/OrgName/ProjectName/commit/a5"
	},
	{
		message: "related to https://trello.com/c/EPJ8UQb7 and some more text",
		url: "https://github.com/OrgName/ProjectName/commit/a6"
	}
];

test('should process commits properly', (done) => {
	const results = [];
	processGithubEvents({commits: commits}, (obj) => {
		results.push(obj);
		if (results.length == 6){
			const sortedAnswers = results.sort((a, b) => a.commitUrl > b.commitUrl);
			expect(sortedAnswers).toMatchSnapshot();
			done();
		}
	});
});
