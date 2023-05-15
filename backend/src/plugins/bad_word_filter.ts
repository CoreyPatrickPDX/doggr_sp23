import fs from "fs";

const badWordFilter = function(message) {
	const msgArr = JSON.parse(message).split();
	const badWords = JSON.parse(require("./bad_words.txt"));
	for(const word in badWords){
		if(msgArr.some(item => item === word)){
			return false;
		}
	}
};

export default badWordFilter;
