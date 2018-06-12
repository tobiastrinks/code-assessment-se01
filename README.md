# Technical paper

## 1. Introduction

Intro video: https://www.dropbox.com/s/ckx2g7wdlxmc6k1/code-se-basics-assessments.mp4?dl=0

For the SE Basics Assessment Challenge I decided to use a part of my last project at CODE from January to April. Since we built an interface to enable guests in restaurants to order drinks in restaurants via a voice device, we were required to program an algorithm which compares the order of the guest with the drink menu of the restaurant. This was my main task over the first weeks of the project.

The algorithm has as parameters the drink menu of the restaurant and the order of the guest as a simple string, decoded from different speech API’s like Google Speech, Bing Voice or Wit.ai. As result we expected to choose the right drink out of the drink menu of the restaurant.

## 2. Storing the menu

The drink menu located here: `/api/src/library/sampleMenu.json` itself contains drinks split into keywords which are as short as possible. These keywords are wired together as children of each other. In the end its a tree structure with multiple layers. A clearly identifiable drink is always the lowest layer keyword, means the last child. Example: `Bier > Paulaner > Premium > Pils` makes `Paulaner Premium Pils`

Each keyword has some other attributes which become clear when reading through the algorithm. In our project we stored the menus of the restaurants in a oo-database, I just wanted to make it less complex for this assessment.

## 3. How the algorithm works

You can find the central file of the algorithm in api in `/api/src/library/menuAlgorithm/main.js`. Later I also added an algorithm for other guests service wishes like billing or requiring a server. But this should not be in focus right now.

1. **normalize the input string:** Formatting the `input` string into a standardized format

2. **extracting keywords:** `name` (drink-keyword itself) - `nb` (ordered number) - `size` (drink size) - `conj` (conjunction words eg. 'and' for separating orders)

3. **split products:** apply rule-set for separating different drinks from each other (based on probability of constellations of `name - nb - size`)

4. **name operations:** find final products (lowest child) out of different name-keywords, based on `longest-chain`, `default`-child or `defaultParents` in the menu

5. **final order:** creates final-order-array with `productName`, `size` and `number` by `cfg.json`

## 4. Use of method, tools and principles

- **programming paradigm:** When writing this algorithm I aimed for as small units as possible in object oriented programming style. Therefore I tried to split it into different classes mostly according to the steps I explained above. Most important think for me was to make the code as readable as possible because future changes and bug-fixes are extremely likely.

- **use of algorithms:** Since JavaScript has some functions for sorting, filtering, searching, ... in the `prototype` of lists/arrays, I made use of them to decrease code complexity and increase readability. Beside this I worked with a lot of iteration loops and recursive functions to operate with the menu tree.

- **internet-transactions:** Like you probably already noticed, I also build a testing environment around this algorithm and implemented it into a REST-API. Further I build a small testing webapp. To communicate there are standardized HTTP-Requests used.

- **data-formats:** For the communication between webapp and API I encoded data in json.

## 5. use of frameworks and libraries

For presenting the algorithm, which is the main part of my assessment, I used some npm modules. For building the REST-API I made use of express.js. Further I used jQuery for quickly building up a small webpage for testing the algorithm without writing manual HTTP requests. For coding styleguides I decided to use ESLint with my personal self-made ruleset.
 
## 6. Run and test it

To test my app you can use the `docker-compose.yml` in the root directory of the repository. It spins up a nginx service for the frontend app and a node.js service for the API with implemented algorithm.

You can then send orders via the simple input field in the frontend app (only german supported). After submitting you will see below the matched products from the drink menu and service wishes.

Beside the webapp you can also use the `POST /order` route of the API directly. Therefore you are required to add the order as JSON in the HTTP body: `{ "order": "Ein Bier bitte." }`
