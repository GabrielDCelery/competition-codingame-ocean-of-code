# Codingame Ocean of Code Competition

## What is this project for?

This is my bot for the CodinGame Ocean of Code competition. It is a 1v1 game where both players control a submarine on a 15x15 map and try to track down and sink the opponent using torpedoes and mines.

## Rules

Visit: `https://www.codingame.com/contests/ocean-of-code`

# Highlights of the game strategy

## Tracking the enemy

Since neither player knows the opponent's starting location it was crucial to have a system that tracks the opponent's movements and possible locations.

In order to achieve that at the start of the game I loop through the map cells and create a `phantom submarine` on each empty water cell. At the beginning of each turn I loop through these phantom submarines and `filter them based on my and the opponent's commands`.

This got tricky with the introduction of the `silence` command at the later levels, because that is the only command that `increases` the number of possbile locations.

`Originally` when the opponet was using the silence command `I created copies of the submarines`, but unfortunately this resulted in timeouts, especially with bots that were `spamming the silence command`. So instead of creating copies, for all the submarines that ended up on the same coordinates after executing the silence command I created a composite of those submarines.

In the codebase look for the followings: `getPhantomSubmarinesFilteredByEnemyCommands`, `getPhantomSubmarinesFilteredByOwnCommands`

## Tracking mine deployment

The mine tracking system went through several iterations and was one of the most difficult parts. The final version looks like this:

- Every phantom submarine has a `mine tracker` which is a dictionary for mine ids and coordinates
- Every time a mine is deployed a new key is created on the mine tracker dictionary (the id of the mine), and that object gets populated with all the coordinates where the mine could be deployed.

This way if a phantom submarine gets eliminated the possbile locations for mines also get eliminated alongside it, and if the opponent executes the silence command, the mineTrackers get merged.

In the codebase look for the followings: `appendMineToTracker`, `mergeMineTrackers`, `calculateMineProbabilityMatrix`

## Decision making

For the AI I decided to go with a utility based approach. The main challenge for this section was the issue that a submarine could execute multiple commands in any order. One possible approach in solving this could have been creating a set of macro commands and choosing one for every turn, but instead tried to have a more generic approach.

Basically the way my AI works is it loops through a list of commands grouped together and chooses one command from each set if the utility is above a certain threshold. If a command was already chosen from a previous set then it skips that calculation. Looking back at the challenge using macros probably would have been easier, but there were certain advantages to the chosen approach (though it had its fair share of problems too).

In the codebase look for the followings: `playerAiCommandSets`, `pickCommandsForTurn`

## Functional programming

This time instead of using object oriented programming I decided to go with functional programming and a data oriented approach. In the end that let me do faster prototyping and made tracking down bugs and refactoring easier.

# Summary

Overall I was more satisfied with the bot than not, I wish I could get with it to the highest `Legend` league, but that is for the next challenge.

## Parts of the code that I am proud of

- The code that tracks the possible locations for the opponent and mines came together nicely
- The smaller utility functions that were the core building blocks in the decision making

## Parts of the code that I am dissatisfied with

- Although the building blocks for the utility AI were in place, the actual implementation for decision making had its "issues", measuring the efficiency of tweaking was near impossible with the above mentioned generic AI solution
