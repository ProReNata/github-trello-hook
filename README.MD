
# Github to Trello hook

ProReNatas Github to Trello hook, for moving and commenting cards from Github commits.

### Usage:

Use the Trello card URL in the Github commit as:

	fixes: https://trello.com/c/fAFTas32<optional: /the-card-description>

or

	related: https://trello.com/c/fAFTas32<optional: /the-card-description>

Using `fixed` or `fixes` will comment the card and move to Implemented in same board.  
Using `related` will not move card, just leave a comment in the card.

### Testing:

	npm test

### Deploying

Commit the changes, login/setup ProReNatas Heroku account and run:

	git push heroku master
