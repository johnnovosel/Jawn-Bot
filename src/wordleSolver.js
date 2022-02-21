import fs, { readlink } from 'fs';

function setOccuranceMap(wordlesArr) {
  let occuranceMap = new Map();
  let totalLetters = 0;
  wordlesArr.forEach(string => {
    if (string.length != 5) return;

    var stringArr = string.split("");
    for (var i = 0; i < stringArr.length; i++) {
      ++totalLetters;
      if (occuranceMap.get(stringArr[i]) == null) {
        occuranceMap.set(stringArr[i], 1);
      } else {
        occuranceMap.set(stringArr[i], occuranceMap.get(stringArr[i]) + 1);
      }
    }
  })

  const sortedLetterOccurance = new Map([...occuranceMap.entries()].sort((a, b) => b[1] - a[1]));

  sortedLetterOccurance.forEach((values,keys) => {
    var percentage = (100 * values) / totalLetters;

    sortedLetterOccurance.set(keys, Math.round(percentage * 1000) / 1000)
  })
  return sortedLetterOccurance;
}

function scoreWords(sortedOccuranceMap, wordlesArr) {
  let scoredMap = new Map();

  for(let i = 0; i < wordlesArr.length; i++) {
    let score = 0;
    let str = wordlesArr[i].split("");

    for (let j = 0; j < str.length; j++) {
      score += sortedOccuranceMap.get(str[j]);
    }
    scoredMap.set(wordlesArr[i], score);
  }
  return new Map([...scoredMap.entries()].sort((a, b) => b[1] - a[1]));
}

export default function start(client) {
  let finalDisplayAnswerArr = []
  const answer = "other";
  const answerArr = answer.split("");
  let wordles = fs.readFileSync("././allowed_words.txt", 'utf-8');
  let wordlesArr = wordles.split(/\n|\,|\r/);
  wordlesArr = wordlesArr.filter(word => {if(word === '') return false; return true})
  let guessNumber = 1;
  while(guessNumber < 10) {
    if(wordlesArr.length === 1 && wordlesArr[0] === answer) {
      console.log(`found wordle in ${wordlesArr} ${guessNumber - 1} tries`)
      currentDisplayAnswerArr = [":green_square:", ":green_square:", ":green_square:", ":green_square:", ":green_square:"]
      finalDisplayAnswerArr.push(currentDisplayAnswerArr);
      displayResults(client, finalDisplayAnswerArr, guessNumber);
      break;
    }


    let currentDisplayAnswerArr = [":black_large_square:", ":black_large_square:", ":black_large_square:", ":black_large_square:", ":black_large_square:"];

    let sortedLetterOccurance = setOccuranceMap(wordlesArr)
    let scoredWordsMap = scoreWords(sortedLetterOccurance, wordlesArr);
    let guess = null;
    scoredWordsMap.forEach((values, keys) => {
      let keyArr = keys.split("")
      let testRepeatedLetterSet = new Set();
      for(let i = 0; i < keyArr.length; i++) {
        testRepeatedLetterSet.add(keyArr[i]);
      }
      if(testRepeatedLetterSet.size == 5 && guess === null) { 
        guess = keys;
        return;
      }
    })

    if(guess == null) {
      [guess] = scoredWordsMap.keys();
    }
    
    if(guess === answer) {
      console.log(`Wordle was ${guess} found in ${guessNumber}`);
      currentDisplayAnswerArr = [":green_square:", ":green_square:", ":green_square:", ":green_square:", ":green_square:"]
      finalDisplayAnswerArr.push(currentDisplayAnswerArr);
      displayResults(client, finalDisplayAnswerArr, guessNumber);
      break;
    }

    console.log(guess)

    let guessArr = guess.split("");
    let notAtThisSpotButInWord = []
    let containsSet = new Set();
    let removeSet = new Set();
    let matchMap = [];

    for(let i = 0; i < guessArr.length; i++) {
      if(guessArr[i] === answerArr[i]) {
        matchMap.push([guessArr[i], i]);
        currentDisplayAnswerArr[i] = ":green_square:"
      }
    }
    wordlesArr = wordlesArr.filter(word => {
      let wordArr = word.split("");
      let passed = true;

      for (let index = 0; index < matchMap.length; index++) {
        if(wordArr[matchMap[index][1]] != matchMap[index][0]) {
          passed = false;
        }       
      }
      return passed;
    })

    // get a list of letters in the word and letters not in the word
    for(let i = 0; i < guessArr.length; i++) {
      if(answerArr.includes(guessArr[i])) {
        containsSet.add(guessArr[i]);

        if(!arrayAlreadyHasArray(matchMap, [guessArr[i], i]))
          notAtThisSpotButInWord.push([guessArr[i], i]);
        if (currentDisplayAnswerArr[i] != ":green_square:" || "") {
            currentDisplayAnswerArr[i] = ":yellow_square:"
        }
      } else {
        removeSet.add(guessArr[i]);
        currentDisplayAnswerArr[i] = ":black_large_square:"
      }
    }

    // filter the word list of invalid words
    wordlesArr = wordlesArr.filter(word => {
      let wordArr = word.split("");
      let passed = true;

      // letter is in the word but not at this spot
      for(let i = 0; i < notAtThisSpotButInWord.length; i++) {
        if(wordArr[notAtThisSpotButInWord[i][1]] == notAtThisSpotButInWord[i][0])
          passed = false;
      }

      // word contains a letter it should not
      removeSet.forEach((letter) => {
        if(word.includes(letter)) {
          passed = false;
        }
      })

      // word does not contain a letter it should
      containsSet.forEach((letter) => {
        if(!word.includes(letter)) {
          passed = false;
        }
      })

      return passed;
    }) 

    guessNumber++;
    finalDisplayAnswerArr.push(currentDisplayAnswerArr);
  }

  return guessNumber;
}

function displayResults(client, results, number) {
    const channel = client.channels.cache.get("931418680074596455");

    let message = `Beep Boop that word was easy!\n\nWordle 247 ${number}/6\n\n`
    // let message = "Beep Boop matt smells like poop\n"
    for(let i = 0; i < results.length; i++) {
        message = message +results[i][0]+results[i][1]+results[i][2]+results[i][3]+results[i][4] + '\n';
    }
    channel.send(message);
} 

function test() {
  let wordles = fs.readFileSync("././Wordles.txt", 'utf-8');
  let wordlesArr = wordles.split(/\n|\,|\r/);
  wordlesArr = wordlesArr.filter(word => {if(word === '') return false; return true})
  let count = 0;
  let size = wordlesArr.length;

  for(let i = 0; i < wordlesArr.length; i++) {
    console.log(count)
    count += start(wordlesArr[i]);
  }

  console.log(`Average: ${count / size}`);
}

function arrayAlreadyHasArray(arr, subarr){
  for(var i = 0; i<arr.length; i++){
      let checker = false
      for(var j = 0; j<arr[i].length; j++){
          if(arr[i][j] === subarr[j]){
              checker = true
          } else {
              checker = false
              break;
          }
      }
      if (checker){
          return true
      }
  }
  return false
}

// test();