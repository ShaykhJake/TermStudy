/**
 * Simple Term Study, @ Copyright PidginForge 2021
 * License: FOSS
 * Author: Jacob Wagner
 */

// PART 1

// Import necessary modules
import * as publicLibrary from "./publicLibrary_1.4.js";

// uncomment the following line to easily reset local storage during testing
// localStorage.clear();

// Grab the View Elements and Define Constants
const NewUserView = document.getElementById("NewUserView");
const DashboardView = document.getElementById("DashboardView");
const ListDetailsView = document.getElementById("ListDetailsView");
const MultipleChoiceView = document.getElementById("MultipleChoiceView");
const FlashCardsView = document.getElementById("FlashCardsView");
const UserSettingsView = document.getElementById("UserSettingsView");
const PublicLibrariesView = document.getElementById("PublicLibrariesView");
const TermEditView = document.getElementById("TermEditView");
const ListEditView = document.getElementById("ListEditView");

// Build an array of all of the different views
const viewElements = [
	NewUserView,
	DashboardView,
	ListDetailsView,
	MultipleChoiceView,
	FlashCardsView,
	UserSettingsView,
	PublicLibrariesView,
	TermEditView,
	ListEditView,
];

// Build Basic userProgress Object
let userProgress = {
	userName: null,
	lastAccess: new Date().toDateString(),
	lastSaved: "Never",
	termLists: [],
	minimumMasteryTimes: 2,
	minimumMasteryPercent: 0.6,
	hideMasteredTerms: true,
};

// Check Local Storage for User Progress:
if (retrieveLocalStorage()) {
	// If the user has a profile in local storage, show the dashboard
	showDashboardView();
} else {
	// Otherwise, show the new user view
	showNewUserView();
}

///////////
// VIEW FUNCTIONS
///////////

/**
 * Shows New User View
 */
function showNewUserView() {
	showViewHideOthers(NewUserView);
	// Grab the new user button
	const NewUserConfirmButton = document.getElementById(
		"NewUserConfirmButton"
	);

	NewUserConfirmButton.addEventListener("click", () => {
		const NewUserName = document.getElementById("NewUserName");
		let name = NewUserName.value;
		if (name.length > 0) {
			NewUserName.style.borderColor = "#000000";

			// Set up new user
			userProgress.userName = name;
			userProgress.lastAccess = new Date().toDateString();
			updateLocalStorage();
			showDashboardView();
		} else {
			NewUserName.style.borderColor = "#FF0000";
		}
	});
}

/**
 * Shows the dashboard view
 */
function showDashboardView() {
	DashboardView.innerHTML = `
    <h1 id="DashboardTitle">Welcome, ${
		userProgress.userName
	} <i class="material-icons" id="SettingsButton">settings</i></h1>
    <p>Date of Last Access: <span id="LastAccessDate">${
		userProgress.lastAccess
	}</span></p>
    <hr>
    <h2>Your Term Lists</h2>
    <button id="CreateListButton">Create List  <i class="material-icons">add</i></button>
    <input id="ImportNewListFile" type="file" class="fileInput" />
    <button id="ImportNewListButton">Import New List  <i class="material-icons">upload</i></button>
    <button id="ViewPublicLibrariesButton">Import Public Lists  <i class="material-icons">library_books</i></button>
    <div id="ListTableDiv"></div>
    ${
		!userProgress.termLists || userProgress.termLists.length < 1
			? "<p>You currently have no lists. Either create one, import one from a text file, or import from the public library.</p>"
			: ""
	}

`;
	const CreateListButton = document.getElementById("CreateListButton");
	const ImportNewListButton = document.getElementById("ImportNewListButton");
	const ViewPublicLibrariesButton = document.getElementById(
		"ViewPublicLibrariesButton"
	);

	ViewPublicLibrariesButton.addEventListener("click", showPublicLibraryView);

	// User Clicks to Import a New List
	ImportNewListButton.addEventListener("click", () => {
		const ImportListFile = document.getElementById("ImportNewListFile");
		ImportListFile.addEventListener("change", importNewList, false);
		ImportListFile.click();
	});

	CreateListButton.addEventListener("click", () => {
		const newList = {
			title: "New List",
			terms: [],
			lastTested: "Never",
		};
		showListEditView(newList);
	});

	const SettingsButton = document.getElementById("SettingsButton");
	SettingsButton.addEventListener("click", showUserSettings);

	showViewHideOthers(DashboardView);
	renderListTable();
}

/**
 * Shows the User Settings View
 */
function showUserSettings() {
	showViewHideOthers(UserSettingsView);
	UserSettingsView.innerHTML = `
    <h1>User Profile Settings</h1>
    <hr>
    <p>Date of Last Backup: <span id="LastSaveDate">${
		userProgress.lastSaved ? userProgress.lastSaved : "NEVER"
	}</span></p>
    <button id="SaveProgressButton">Backup Progress <i class="material-icons">file_download</i></button>
    <input id="LoadProgressFile" type="file" class="fileInput" />
    <button id="LoadProgressButton">Load Saved Progress  <i class="material-icons">upload</i></button>
    <hr>
    <h3>User Info:</h3>
        <label for="UserNameInput">User Name</label>
        <input type="text" id="UserNameInput" name="UserNameInput" value="${
			userProgress.userName
		}">
        
    <h3>Mastery Settings:</h3>
        <label for="MasteryThresholdInput">Mastery Percentage Threshold</label>    
        <input type="range" id="MasteryThresholdInput" name="MasteryThresholdInput" value="${
			userProgress.minimumMasteryPercent
		}"" min="0.1" max="1" step="0.1">
        <span id="MasteryPercentSpan">${
			userProgress.minimumMasteryPercent * 100
		}%</span>
        <br><br>
        <label for="MinimumCorrectInput">Minimum Correct for Mastery</label>
        <input type="number" id="MinimumCorrectInput" name="MinimumCorrectInput" min="1" max="15" step="1" value="${
			userProgress.minimumMasteryTimes
		}">
        
    <h3>Game Defaults:</h3>
        <input type="checkbox" id="HideMasteredInput" name="HideMasteredInput" ${
			userProgress.hideMasteredTerms ? "checked" : ""
		}>
        <label for="HideMasteredInput">Hide Mastered Terms from Quiz</label><br>
    <br>
    <hr>
    <button id="SaveSettingsButton">Save  <i class="material-icons">done</i></button>
    <button id="CancelSettingsButton">Cancel  <i class="material-icons">close</i></button>
    `;

	const LoadProgressButton = document.getElementById("LoadProgressButton");
	const SaveProgressButton = document.getElementById("SaveProgressButton");

	// User clicks to load progress
	LoadProgressButton.addEventListener("click", () => {
		const ImportListFile = document.getElementById("LoadProgressFile");
		ImportListFile.addEventListener("change", loadSavedProgress, false);
		ImportListFile.click();
	});

	SaveProgressButton.addEventListener("click", () => {
		saveProgress();
	});

	const UserNameInput = document.getElementById("UserNameInput");
	const MasteryThresholdInput = document.getElementById(
		"MasteryThresholdInput"
	);
	const MinimumCorrectInput = document.getElementById("MinimumCorrectInput");
	const HideMasteredInput = document.getElementById("HideMasteredInput");

	const MasteryPercentSpan = document.getElementById("MasteryPercentSpan");

	MasteryThresholdInput.addEventListener("input", () => {
		MasteryPercentSpan.innerHTML = `${MasteryThresholdInput.value * 100}%`;
	});

	document
		.getElementById("SaveSettingsButton")
		.addEventListener("click", () => {
			// get elements

			// validate and save data

			if (UserNameInput.value.length < 1) {
				UserNameInput.style.borderColor = "#FF0000";
			} else if (MinimumCorrectInput.value < 1) {
				MinimumCorrectInput.style.borderColor = "#FF0000";
			} else {
				userProgress.userName = UserNameInput.value;
				userProgress.minimumMasteryPercent =
					MasteryThresholdInput.value;
				userProgress.minimumMasteryTimes = MinimumCorrectInput.value;
				userProgress.hideMasteredTerms = HideMasteredInput.checked;
				updateLocalStorage();
				showDashboardView();
			}
		});
	document
		.getElementById("CancelSettingsButton")
		.addEventListener("click", () => {
			showDashboardView();
		});
}

/**
 * Shows the details of a term list
 * @param {object} list
 */
function showListDetailsView(list) {
	ListDetailsView.innerHTML = `
        <button id="ReturnToDashboardButton">Return to Dashboard  <i class="material-icons material-icons.md-18">keyboard_return</i></button>
        <hr>
        <h1 id="#ListViewTitle">${list.title} <i class="material-icons icon-button" id="EditListButton">settings</i></h1>
        <p>${list.terms.length} Total Terms; <span id="MasteryScoreSpan">XX</span> Mastered</p>
		<p class="tinyText">mastery stats are based on user preferences</p>
		<button id="ResetMasteryButton">Reset Mastery</button>
		<hr>
        <button id="TestMultipleChoiceButton">Multiple Choice Quiz <i class="material-icons">quiz</i></button>
        <hr>
        <button id="AddTermButton">Add New Term <i class="material-icons">add</i></button>
        <button id="ExportListButton">Export List <i class="material-icons">file_download</i></button>

        <div id="TermTableDiv"></div>
    `;
	const TermTableDiv = document.getElementById("TermTableDiv");
	TermTableDiv.classList.add("TermTableDiv");
	document
		.getElementById("ResetMasteryButton")
		.addEventListener("click", () => {
			resetMastery(list);
			showListDetailsView(list);
			console.log("hello");
		});
	const MasteryScoreSpan = document.getElementById("MasteryScoreSpan");
	// Calculate mastery
	let masteredCount = 0;
	list.terms.forEach((term) => {
		if (
			(term.timesTested && !term.timesTested) ||
			(term.timesCorrect >= userProgress.minimumMasteryTimes &&
				term.timesCorrect / term.timesTested >=
					userProgress.minimumMasteryPercent)
		) {
			masteredCount++;
		}
	});
	MasteryScoreSpan.innerHTML = masteredCount;
	// Event listeners for Multiple Choice, Flashcards, & Return to Dashboard
	document
		.getElementById("TestMultipleChoiceButton")
		.addEventListener("click", () => {
			testMultipleChoice(list);
		});

	// document.getElementById("TestFlashCardsButton").addEventListener('click', () => {
	//     console.log("Not Yet Implemented");
	// })

	document
		.getElementById("ReturnToDashboardButton")
		.addEventListener("click", () => {
			showDashboardView();
			ListDetailsView.innerHTML = ``;
		});
	document.getElementById("EditListButton").addEventListener("click", () => {
		showListEditView(list);
	});
	// Create event listener to add a term
	document.getElementById("AddTermButton").addEventListener("click", () => {
		const term = {
			term: "",
			definition: "",
			timesCorrect: 0,
			timesTested: 0,
		};
		showTermEditView(term, list);
	});

	// Create event listener to export a list
	document
		.getElementById("ExportListButton")
		.addEventListener("click", () => {
			exportList(list);
		});

	// loop through terms to create term boxes
	list.terms.forEach((term) => {
		const box = document.createElement("div");
		box.classList.add("termBox");
		box.innerHTML = `
        <h2>${term.term} </h2>
        <p>${term.definition}</p>
        <p class="tinyText">${term.timesCorrect} times correct out of ${term.timesTested} times seen</p>
        `;
		// Create an Edit Button (must create separately for dynamic assignment)
		const TermEditButton = document.createElement("div");
		TermEditButton.innerHTML = `<i class="material-icons icon-button">settings</i>`;
		TermEditButton.addEventListener("click", () => {
			showTermEditView(term, list);
		});
		box.appendChild(TermEditButton);

		// Append the new box element to the storing div
		TermTableDiv.appendChild(box);
	});

	// save for last
	showViewHideOthers(ListDetailsView);
}

/**
 * Loads a multiple choice test
 * @param {object} list
 */
function testMultipleChoice(list) {
	// Show the view
	showViewHideOthers(MultipleChoiceView);
	// Build the HTML
	MultipleChoiceView.innerHTML = `
        <button id="ReturnToListButton">Return to List</button>
        <button id="ReturnToDashboard">User Dashboard</button>
        <H2>Multiple Choice Quiz</h2>
        <p class="tinyText">${list.terms.length} Total Terms</p>
		<hr>
        <div id="ScoreBoard"></div>
        <hr>
        <div id="MCQuizBox">
        </div>
    `;
	document
		.getElementById("ReturnToDashboard")
		.addEventListener("click", () => {
			showDashboardView();
		});
	document
		.getElementById("ReturnToListButton")
		.addEventListener("click", () => {
			showListDetailsView(list);
		});

	const MCQuizBox = document.getElementById("MCQuizBox");

	// Make a copy of the master terms array, factoring in user preferences

	let workingArray = [];
	list.terms.forEach((term) => {
		let mastered = false;
		if (userProgress.hideMasteredTerms) {
			if (
				!term.timesTested ||
				userProgress.minimumMasteryTimes > term.timesCorrect ||
				term.timesCorrect / term.timesTested <
					userProgress.minimumMasteryPercent
			) {
				workingArray.push(term);
			}
		} else {
			workingArray.push(term);
		}
	});

	// Randomize the order of the new array
	workingArray = shuffleArray(workingArray);

	let currentItem = 0;

	const scoreBoardDiv = document.getElementById("ScoreBoard");
	let scoreBoard = {
		correct: 0,
		seen: 0,
		remaining: 0,
		scoreBoard: scoreBoardDiv,
	};

	// Update the time last tested
	list.lastTested = new Date().toDateString();
	renderPrompt(workingArray, currentItem, list, MCQuizBox, scoreBoard);
}

/**
 * This will build an empty list or edit an existing list
 * @param {object} termList
 */
function showListEditView(termList) {
	showViewHideOthers(ListEditView);
	ListEditView.innerHTML = `
    <h1>List Editor</h1>
    <hr>
        <label for="TitleInput">List Title</label>
        <input type="text" id="TitleInput" name="TitleInput" value="${termList.title}">
    <hr>
    <button id="SaveListEditButton">Save Edit  <i class="material-icons">done</i></button>
    <button id="CancelListEditButton">Cancel Edit  <i class="material-icons">close</i></button>
    <button id="DeleteListButton">Delete List  <i class="material-icons">delete</i></button>
    `;
	const SaveListEditButton = document.getElementById("SaveListEditButton");
	const CancelListEditButton = document.getElementById(
		"CancelListEditButton"
	);
	const DeleteListButton = document.getElementById("DeleteListButton");

	const TitleInput = document.getElementById("TitleInput");

	SaveListEditButton.addEventListener("click", () => {
		// Validate Input
		const titleInputText = TitleInput.value;

		if (titleInputText.length < 1) {
			TitleInput.style.borderColor = "#FF0000";
		} else {
			const listIndex = userProgress.termLists.indexOf(termList);
			termList.title = titleInputText;
			if (listIndex >= 0) {
				userProgress.termLists[listIndex] = termList;
			} else {
				userProgress.termLists.push(termList);
			}

			updateLocalStorage();
			ListEditView.innerHTML = ``;
			showListDetailsView(termList);
		}
	});
	CancelListEditButton.addEventListener("click", () => {
		ListEditView.innerHTML = ``;
		showListDetailsView(termList);
	});
	DeleteListButton.addEventListener("click", () => {
		// Confirm Deletion
		let answer = window.confirm(
			`Are you sure you want to delete the list "${termList.title}"?`
		);
		if (answer) {
			// Grab item index and delete it
			const listIndex = userProgress.termLists.indexOf(termList);
			userProgress.termLists.splice(listIndex, 1);
			updateLocalStorage();
			ListEditView.innerHTML = ``;
			showDashboardView();
		} else {
			return false;
		}
	});
}

/**
 * Shows the Public Term Libraries Page
 */
function showPublicLibraryView() {
	const listPackage = publicLibrary.getPackage();
	showViewHideOthers(PublicLibrariesView);
	PublicLibrariesView.innerHTML = `
        <button id="ReturnToDashboardButtonFromLibrary">Return to Dashboard  <i class="material-icons">keyboard_return</i></button>
        <hr>
        <h1>Public Term List Library</h1>
        <div id="LibraryTableDiv"></div>
    `;
	document
		.getElementById("ReturnToDashboardButtonFromLibrary")
		.addEventListener("click", () => {
			showDashboardView();
		});

	const LibraryTableDiv = document.getElementById("LibraryTableDiv");
	LibraryTableDiv.classList.add("listTableDiv");
	listPackage.forEach((list) => {
		const ListBox = document.createElement("div");
		ListBox.classList.add("listBox");
		ListBox.innerHTML = `
            <h2>${list.title}</h2>
            <p>${list.term_count} Terms</p>
        `;
		const newButton = document.createElement("button");
		newButton.innerHTML = `Import`;
		ListBox.appendChild(newButton);
		LibraryTableDiv.appendChild(ListBox);
		newButton.addEventListener("click", () => {
			fetchLibrary(list.fileName);
		});
	});
}

function resetMastery(termList) {
	termList.terms.forEach((term) => {
		term.timesCorrect = 0;
		term.timesTested = 0;
	});
	// update the termList
	updateLocalStorage();
}

/**
 * This will build an empty object for a new term or edit/delete an existing term
 * @param {object} term - can be a new term if needed
 * @param {object} termList
 */
function showTermEditView(term, termList) {
	showViewHideOthers(TermEditView);
	TermEditView.innerHTML = `
    <h1>Term Editor</h1>
        <label for="TermInput">Term</label>
        <input type="text" id="TermInput" name="TermInput" value="${term.term}">
        <br><br>
        <label for="DefinitionInput">Definition</label>
        <textarea id="DefinitionInput" name="DefinitionInput" rows="4" cols="50">${term.definition}</textarea>

    <hr>
    <button id="SaveTermEditButton">Save Edit <i class="material-icons">done</i></button>
    <button id="CancelTermEditButton">Cancel Edit <i class="material-icons">close</i></button>
    <button id="DeleteTermButton">Delete Term  <i class="material-icons">delete</i></button>
    `;
	const SaveTermEditButton = document.getElementById("SaveTermEditButton");
	const CancelTermEditButton = document.getElementById(
		"CancelTermEditButton"
	);
	const DeleteTermButton = document.getElementById("DeleteTermButton");

	const TermInput = document.getElementById("TermInput");
	const DefinitionInput = document.getElementById("DefinitionInput");

	SaveTermEditButton.addEventListener("click", () => {
		// Validate Input
		const termInputText = TermInput.value;
		const definitionInputText = DefinitionInput.value;
		if (termInputText.length < 1) {
			TermInput.style.borderColor = "#FF0000";
		} else if (definitionInputText.length < 1) {
			DefinitionInput.style.borderColor = "#FF0000";
		} else {
			const termIndex = termList.terms.indexOf(term);
			term.term = termInputText;
			term.definition = definitionInputText;
			if (termIndex >= 0) {
				termList.terms[termIndex] = term;
			} else {
				termList.terms.push(term);
			}
			updateLocalStorage();
			TermEditView.innerHTML = ``;
			showListDetailsView(termList);
		}
	});
	CancelTermEditButton.addEventListener("click", () => {
		TermEditView.innerHTML = ``;
		showListDetailsView(termList);
	});
	DeleteTermButton.addEventListener("click", () => {
		// Confirm Deletion
		let answer = window.confirm(
			`Are you sure you want to delete the term "${term.term}"?`
		);
		if (answer) {
			// Grab item index and delete it
			const termIndex = termList.terms.indexOf(term);
			termList.terms.splice(termIndex, 1);
			updateLocalStorage();
			TermEditView.innerHTML = ``;
			showListDetailsView(termList);
		} else {
			return false;
		}
	});
}

//////////////
// Rendering Functions
//////////////

function renderListTable() {
	const ListTableDiv = document.getElementById("ListTableDiv");
	ListTableDiv.innerHTML = "";

	userProgress.termLists.forEach((list) => {
		// grab the index of the current list (important for later)
		const listIndex = userProgress.termLists.indexOf(list);

		// establish a new div element to represent the box
		let box = document.createElement("div");

		// add the class "listBox"
		box.classList.add("listBox");

		// calculate mastery
		let totalMastered = 0;
		if (userProgress.minimumMasteryPercent == null) {
			userProgress.minimumMasteryPercent = 0.6;
			updateLocalStorage();
		}
		if (userProgress.minimumMasteryTimes == null) {
			userProgress.minimumMasteryTimes = 2;
			updateLocalStorage();
		}

		list.terms.forEach((term) => {
			if (
				term.timesTested > 0 &&
				term.timesCorrect >= userProgress.minimumMasteryTimes &&
				term.timesCorrect / term.timesTested >
					userProgress.minimumMasteryPercent
			) {
				totalMastered++;
			}
		});
		let masteryPercent = 0;
		if (list.terms.length > 0) {
			masteryPercent = totalMastered / list.terms.length;
		}
		// using string literal, build the internal HTML

		let inner = `
        <h2>${list.title}</h2>
        <h3>${list.terms.length} Terms</h3>
        <p><b>Last Tested:</b><br> ${
			list.lastTested ? list.lastTested.slice(0, 10) : "never"
		}</p>
        <p><b>Mastery:</b><br> ${totalMastered} cards (${(
			masteryPercent * 100
		).toFixed(2)}%)</p>
        `;
		// Add the HTML to the box div
		box.innerHTML = inner;

		// Add an event listener for a click event
		box.addEventListener("click", () => {
			showListDetailsView(list);
		});

		// Append the new box to the list of boxes
		ListTableDiv.appendChild(box);
	});
}

/**
 * Renders a Scoreboard
 * @param {object} scoreBoard
 */
function renderScoreBoard(scoreBoard) {
	// Scores is an object of: # correct of # seen, # remaining
	const inner = `
        ${scoreBoard.correct} correct of ${scoreBoard.seen} seen; ${scoreBoard.remaining} remaining for mastery
    `;
	scoreBoard.scoreBoard.innerHTML = inner;
}

/**
 * Renders a new multiple choice prompt
 * @param {array} workingArray
 * @param {object} currentItem
 * @param {object} list
 * @param {html element} targetDiv
 * @param {object} scoreBoard
 * @returns
 */
function renderPrompt(workingArray, currentItem, list, targetDiv, scoreBoard) {
	scoreBoard.remaining = workingArray.length;
	renderScoreBoard(scoreBoard);
	if (currentItem >= workingArray.length) {
		if (workingArray.length < 1) {
			targetDiv.innerHTML = `No Unmastered Terms Left!`;
			return false;
		} else {
			workingArray = shuffleArray(workingArray);
			currentItem = 0;
		}
	}
	targetDiv.innerHTML = `
        <div id="MCQuizPrompt"></div>
        <div id="MCQuizChoices"></div>
    `;

	const MCQuizPrompt = document.getElementById("MCQuizPrompt");
	const MCQuizChoices = document.getElementById("MCQuizChoices");

	const workingTerm = workingArray[currentItem];
	const orginalTerm = list.terms[list.terms.indexOf(workingTerm)];

	// Generate Random Answers
	let randomChoices = [];

	// Push the correct answer index
	randomChoices.push(workingTerm); // TODO set this to termIndex
	// Add three more answers so long as they aren't in the list
	while (
		randomChoices.length < workingArray.length &&
		randomChoices.length < 4
	) {
		const rnd = randomInt(workingArray.length);
		const rndTerm = workingArray[rnd];
		if (randomChoices.indexOf(rndTerm) === -1) {
			randomChoices.push(rndTerm);
		}
	}

	// randomize answer order
	randomChoices = shuffleArray(randomChoices);

	// Set up term view
	MCQuizPrompt.innerHTML = `
    <h1>${workingTerm.term}</h1>
    <p class="tinyText">Correct ${workingTerm.timesCorrect} out of ${workingTerm.timesTested} times tested</p>
    `;

	workingTerm.term;
	scoreBoard.seen++;

	randomChoices.forEach((choice) => {
		const ChoiceButton = document.createElement("div");
		const choiceIndex = workingArray.indexOf(choice);
		ChoiceButton.setAttribute("data-choice", choiceIndex);
		ChoiceButton.classList.add("choiceButton");
		ChoiceButton.innerHTML = choice.definition;

		ChoiceButton.addEventListener("click", function checkIt() {
			// check to see if the item is correct
			styleAnswers(ChoiceButton, currentItem, MCQuizChoices);
			orginalTerm.timesTested++;
			if (choice == workingArray[currentItem]) {
				console.log("WIN!");
				orginalTerm.timesCorrect++;

				// remove item from working array if it meets minimum mastery
				if (
					orginalTerm.timesCorrect >=
						userProgress.minimumMasteryTimes &&
					orginalTerm.timesCorrect / orginalTerm.timesTested >
						userProgress.minimumMasteryPercent &&
					userProgress.hideMasteredTerms
				) {
					workingArray.splice(currentItem, 1);
					console.log(workingArray.length);
				} else {
					currentItem++;
				}
				scoreBoard.correct++;
			} else {
				console.log("FAIL!");
				currentItem++;
			}
			updateLocalStorage();
			setTimeout(function () {
				renderPrompt(
					workingArray,
					currentItem,
					list,
					targetDiv,
					scoreBoard
				);
			}, 1000);
		});
		MCQuizChoices.appendChild(ChoiceButton);
	});
}

function styleAnswers(choice, correctAnswer, container) {
	const selectedIndex = parseInt(choice.getAttribute("data-choice"));
	const buttons = document.querySelectorAll(".choiceButton");
	buttons.forEach((button) => {
		// style all choices
		const choiceIndex = parseInt(button.getAttribute("data-choice"));
		if (choiceIndex == correctAnswer && choiceIndex == selectedIndex) {
			button.classList.add("right-choice");
			button.innerHTML = `${button.innerHTML} <i class="material-icons">done</i>`;
		} else if (
			choiceIndex != correctAnswer &&
			choiceIndex == selectedIndex
		) {
			button.classList.add("wrong-choice");

			button.innerHTML = `${button.innerHTML} <i class="material-icons">close</i>`;
		} else if (choiceIndex == correctAnswer) {
			button.classList.add("right-answer");
			button.classList.add("blink_me");
			console.log("hello");
			button.innerHTML = `<i class="material-icons">arrow_forward</i>${button.innerHTML} `;
		} else {
			button.classList.add("wrong-answer");
		}

		button.disabled = true;
		const cln = button.cloneNode(true);
		cln.classList.remove("choiceButton");
		cln.classList.add("choiceButtonResponse");
		container.appendChild(cln);
		button.remove();
	});
}

///////////
// HELPER FUNCTIONS
///////////

/**
 * Updates local storage with the user progress
 */
function updateLocalStorage() {
	localStorage.setItem("userProgress", JSON.stringify(userProgress));
}

/**
 * Retrieves a user's progress from local storage
 * Note that this should only be done once at launch
 */
function retrieveLocalStorage() {
	// attempt to retrieve JSON from local storage
	const localProgress = localStorage.getItem("userProgress");
	// if the item exists, parse; else return false
	if (localProgress != null) {
		userProgress = JSON.parse(localProgress);
		console.log(
			`User progress loaded from local storage: ${userProgress} `
		);
		return true;
	} else {
		console.log("User progress not found in local storage.");
		return false;
	}
}

/**
 * Show's the specified view and hides all others
 * @param {html element object} view
 */
function showViewHideOthers(view) {
	viewElements.forEach((element) => {
		if (element == view) {
			element.style.display = "block";
		} else {
			element.style.display = "none";
		}
	});
}

/**
 * Saves a user's progress to a file which is a JSON object stored on the user's machine
 * this will pull the current object from the local storage, which is where the progress
 * will be constantly stored to prevent accidental reset
 * @param {*} UserProgress
 */
function saveProgress() {
	userProgress.lastSaved = new Date().toDateString();

	let textOuput = JSON.stringify(userProgress);

	const blob = new Blob([textOuput], { type: "text/plain;charset=utf-8" });

	let textFile = window.URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.download = "vocab_progress.txt";
	link.href = textFile;
	link.click();

	// Update the Button to Reflect a Save
	SaveProgressButton.style.backgroundColor = "#99FF99";

	updateLocalStorage();
	showDashboardView();
}

/**
 * Loads the user's saved progress file which is a JSON object stored wherever on the user's local machine
 * @param {*} fileName
 */
function loadSavedProgress(e) {
	// Grab the file from the file load event
	let file = e.target.files[0];

	// Initialize a file reader
	const reader = new FileReader();

	// Create function for when the file is read
	reader.addEventListener(
		"load",
		() => {
			const rawText = reader.result;

			try {
				const progress = JSON.parse(rawText);
				if (progress.userName) {
					userProgress.userName = progress.userName;
					userProgress.lastSaved = progress.lastSaved;
					userProgress.termLists = progress.termLists;
					userProgress.minimumMasteryTimes =
						progress.minimumMasteryTimes;
					userProgress.minimumMasteryPercent =
						progress.minimumMasteryPercent;
					userProgress.hideMasteredTerms = progress.hideMasteredTerms;
				}
				updateLocalStorage();
				showUserSettings();
			} catch (e) {
				console.log("Not a valid progress file");
				return false;
			}
			// validate progress
		},
		false
	);

	// Read file if it exists
	if (file) {
		reader.readAsText(file);
	}
}

/**
 * Generates random integer
 * @param {integer} max
 * @returns a random int from 0 - max, exclusive
 */
function randomInt(max) {
	return Math.floor(Math.random() * max);
}

/**
 * Shuffles an array with Fisher-Yates
 * @param {array} inputArray
 * @returns shuffled array
 */
function shuffleArray(inputArray) {
	for (let i = inputArray.length - 1; i > 0; i--) {
		// random number
		const rnd = Math.floor(Math.random() * (i + 1));
		const oldItem = inputArray[i];
		inputArray[i] = inputArray[rnd];
		inputArray[rnd] = oldItem;
	}
	return inputArray;
}

/**
 * Reads a new text file
 * @param {file target object} e
 */
function importNewList(e) {
	// Grab the file from the file load event
	let file = e.target.files[0];

	// Initialize a file reader
	const reader = new FileReader();

	// Create function for when the file is read
	reader.addEventListener(
		"load",
		() => {
			const rawText = reader.result;
			userProgress.termLists.push(parseText(rawText));
			updateLocalStorage();
			showDashboardView();
		},
		false
	);

	// Read file if it exists
	if (file) {
		reader.readAsText(file);
	}
}

/**
 * Parses the raw text of a comma-delimited terms text file
 * @param {string} rawText
 * @returns
 */
function parseText(rawText) {
	const lines = rawText.split("\n");
	const newList = {
		title: "This is a File",
		dateImported: new Date().toDateString(),
		lastTested: null,
		terms: [],
	};
	lines.forEach((line) => {
		// Checks to see if the File as a Title Line as Indicated by a line starting with !
		if (line.charAt(0) == "!") {
			line = line.slice(1, line.length - 1);
			newList.title = line.trim();
		} else {
			// Split the line at the colons
			line = line.split(":");
			// If the length of the new array is > 1
			if (line.length >= 2) {
				const term = {
					term: null,
					definition: null,
				};
				term.term = line[0].trim();
				term.definition = line[1].trim();
				// if there is a third element, it is an explanation
				if (line[2]) {
					term.explanation = line[2].trim();
				}
				// set starting values for timesTested and timesCorrect
				term.timesTested = 0;
				term.timesCorrect = 0;

				// add the term object to the newList.terms array
				newList.terms.push(term);
			}
		}
	});

	// Add the new termlist to the user's term lists
	return newList;
}

/**
 * Loads a public term library from a network location, parses it,
 * and adds it to the user's library
 * @param {string} file
 */
function fetchLibrary(file) {
	fetch(file)
		.then((response) => response.text())
		.then((rawText) => {
			userProgress.termLists.push(parseText(rawText));
			updateLocalStorage();
			showDashboardView();
		});
}

/**
 * Takes the specified list and generates a colon-delimited text file
 * @param {object} list
 */
function exportList(list) {
	// generates a : delimited file
	let newText = `!${list.title}\n`;

	list.terms.forEach((term) => {
		const line = `${term.term}: ${term.definition}\n`;
		newText += line;
	});

	let textFile = null;

	const blob = new Blob([newText], { type: "text/plain;charset=utf-8" });

	textFile = window.URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.download = "list_export.txt";
	link.href = textFile;

	// trigger the download click
	link.click();
}
