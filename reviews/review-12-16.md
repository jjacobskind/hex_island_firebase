# JavaScript Style
- JSHint Errors
- 442 Errors in client/ and 193 in server/ 
- Primarily not using camelCase, prefer to use one style

# Separation and Modularization
- Separate classes into two types:
    + Game Engine
        * Models -> Game STate, Game State Storage
    + Game Rendering
    + Game UI
    + Right now Board in settlers.js has some of both, makes it harder to maintain
    + Separate out classes into their separate files so file directory is better for inspecting what classes are in the app
        * Board
            - Tiles
            - Robber
            - Player (?)
        * Domain specific things to games?
            - Turn Array
- Consider having a Game Data, Game State (these two are the "engine"), Game Scene and Game Render, the Game Engine determines what needs to be shown, puts them into a Game Scene (which is an array of objects that need to be shown).  Objects in the Game Scene (CityView, SettlementView) know how to render, but have no game logic.  GameRender is aware of things like Three.js


# Angular
- BoardCtrl and MainCtrl are both large controllers.
    + MainCtrl should not have so much setup of the Firebase, leave those to the Factories
    + BoardCtrl should have sub controllers, one for Chat, one for playing the game
- The use of the factory to help set up the THREE stuff is incorrect, should use a directive that exposes a controller that you interact with


# Testing
- Game engine should be under heavy Unit Testing

# Deployment
- Good use of Firebase, OAuth and Factories for authentication

# Workflow
- Seems like there was good use of branching and merging of pull requests but I don't see the various feature branches - are they somewhere else?
