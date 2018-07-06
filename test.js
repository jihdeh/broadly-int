var axios = require("axios");
var R = require("ramda");
/*
 * 
 * Challenge => http://challenge.broadly.com/
 *
 */

function classCountStore(students) {
  var inc = 0;
  return students.reduce(function(prev, curr) {
    if(curr.age >= 25) {
      inc += 1 
    };
    return inc;
  }, 0);
};

function getAllClasses() {
  console.log("Making Request to classes....");
  var allClasses = axios.get("http://challenge.broadly.com/classes");
  return allClasses;
};

function getRooms(allClasses) {
  return Promise.all(allClasses.data.classes.map(function(eachClass) {
    var room = axios.get(eachClass).then(function(res) {
      return res.data
    });
    return room;
  }));
};

function getAllStudentsInEachRoom(rooms) {
  return Promise.all(rooms.map(function(room) {
    return returnNextPageResults(room).then(function(res) {
      return res;
    });
  }));
};

function returnNextPageResults(room) {
  var classCount = [];
  if (!room) return;
  return new Promise(function(resolve) {
    console.log("Evaluating Room "+ room.room);
    var students = room.students;
    var studentsAbove25 = classCountStore(students);
    if (room.next) {
      axios.get(room.next).then(function(res) {
        students = res.data.students;
        studentsAbove25 += classCountStore(students);
        classCount.push(studentsAbove25);
        resolve(classCount);
      });
    };
  });
};

function getMeanEvaluation(accumulatedRoomCount) {
  var result = R.mean(R.unnest(accumulatedRoomCount));
  console.log("The mean value of all students is " + result);
  return result;
};

R.composeP(getMeanEvaluation, getAllStudentsInEachRoom, getRooms, getAllClasses)();

//ignore students that are less than 25 years
//get the results
//get the average of the number of students in each class
//an average is the sum of the number of students divided by the numbers of the students there are
