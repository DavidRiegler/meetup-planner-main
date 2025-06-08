export const translations = {
  en: {
    // Auth
    login: "Login",
    register: "Register",
    username: "Username",
    password: "Password",
    loginButton: "Sign In",
    registerButton: "Sign Up",
    logout: "Logout",

    // Navigation
    createJoin: "Create & Join",
    myMeetups: "My Meetups",

    // Meetup Creation
    createMeetup: "Create Meetup",
    joinMeetup: "Join Meetup",
    meetupCode: "Meetup Code",
    title: "Title",
    description: "Description",
    location: "Location",
    date: "Date",
    time: "Time",
    hasAlcohol: "Alcohol Available",
    shoppingList: "Shopping List",
    addItem: "Add Item",
    itemName: "Item Name",
    baseAmount: "Base Amount",
    unit: "Unit",
    category: "Category",
    perPerson: "Per Person",

    // Categories
    food: "Food",
    drink: "Drink",
    alcohol: "Alcohol",
    other: "Other",

    // Participant
    joinMeetupTitle: "Join Meetup",
    isVegetarian: "Vegetarian",
    isVegan: "Vegan",
    drinksAlcohol: "Drinks Alcohol",
    stayDuration: "Stay Duration (hours)",
    joinTime: "Join Time",
    suggestions: "Suggestions for Host",
    bringingItems: "Items I'm Bringing",

    // Participant actions
    editParticipation: "Edit Participation",
    leaveMeetup: "Leave Meetup",
    itemsBringing: "Bringing",
    participationUpdated: "Participation updated successfully!",
    leftMeetup: "Successfully left meetup!",

    // Meetup Details
    meetupDetails: "Meetup Details",
    participants: "Participants",
    costs: "Costs",
    addCost: "Add Cost",
    splitCosts: "Split Costs",
    totalCost: "Total Cost",
    yourShare: "Your Share",

    // Common
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    yes: "Yes",
    no: "No",
    loading: "Loading...",
    error: "Error",
    success: "Success",

    // Messages
    meetupCreated: "Meetup created successfully!",
    joinedMeetup: "Successfully joined meetup!",
    costAdded: "Cost added successfully!",
    loginRequired: "Please login to continue",
  },
  de: {
    // Auth
    login: "Anmelden",
    register: "Registrieren",
    username: "Benutzername",
    password: "Passwort",
    loginButton: "Einloggen",
    registerButton: "Registrieren",
    logout: "Abmelden",

    // Navigation
    createJoin: "Erstellen & Beitreten",
    myMeetups: "Meine Meetups",

    // Meetup Creation
    createMeetup: "Meetup Erstellen",
    joinMeetup: "Meetup Beitreten",
    meetupCode: "Meetup Code",
    title: "Titel",
    description: "Beschreibung",
    location: "Ort",
    date: "Datum",
    time: "Zeit",
    hasAlcohol: "Alkohol Verfügbar",
    shoppingList: "Einkaufsliste",
    addItem: "Element Hinzufügen",
    itemName: "Elementname",
    baseAmount: "Grundmenge",
    unit: "Einheit",
    category: "Kategorie",
    perPerson: "Pro Person",

    // Categories
    food: "Essen",
    drink: "Getränk",
    alcohol: "Alkohol",
    other: "Sonstiges",

    // Participant
    joinMeetupTitle: "Meetup Beitreten",
    isVegetarian: "Vegetarier",
    isVegan: "Veganer",
    drinksAlcohol: "Trinkt Alkohol",
    stayDuration: "Aufenthaltsdauer (Stunden)",
    joinTime: "Beitrittszeit",
    suggestions: "Vorschläge für Gastgeber",
    bringingItems: "Mitgebrachte Gegenstände",

    // Participant actions
    editParticipation: "Teilnahme Bearbeiten",
    leaveMeetup: "Meetup Verlassen",
    itemsBringing: "Bringt Mit",
    participationUpdated: "Teilnahme erfolgreich aktualisiert!",
    leftMeetup: "Meetup erfolgreich verlassen!",

    // Meetup Details
    meetupDetails: "Meetup Details",
    participants: "Teilnehmer",
    costs: "Kosten",
    addCost: "Kosten Hinzufügen",
    splitCosts: "Kosten Aufteilen",
    totalCost: "Gesamtkosten",
    yourShare: "Ihr Anteil",

    // Common
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    yes: "Ja",
    no: "Nein",
    loading: "Laden...",
    error: "Fehler",
    success: "Erfolg",

    // Messages
    meetupCreated: "Meetup erfolgreich erstellt!",
    joinedMeetup: "Erfolgreich dem Meetup beigetreten!",
    costAdded: "Kosten erfolgreich hinzugefügt!",
    loginRequired: "Bitte melden Sie sich an, um fortzufahren",
  },
}

export type TranslationKey = keyof typeof translations.en
