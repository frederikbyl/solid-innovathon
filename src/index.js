import {
   createSolidDataset,
   createThing,
   setThing,
   addInteger,
   addUrl,
   addStringNoLocale,
   saveSolidDatasetAt,
   getSolidDataset,
   getThingAll,
   getStringNoLocale
} from "@inrupt/solid-client";

import { Session } from "@inrupt/solid-client-authn-browser";

import { SCHEMA_INRUPT_EXT, RDF, AS } from "@inrupt/vocab-common-rdf";

const session = new Session();

const buttonLogin = document.querySelector("#btnLogin");
//const buttonCreate = document.querySelector("#btnCreate");
//buttonCreate.disabled=true;
const labelCreateStatus = document.querySelector("#labelCreateStatus");

// 1a. Start Login Process. Call session.login() function.
async function login() {
  if ( !session.info.isLoggedIn ) {
    await session.login({
     // oidcIssuer: "https://broker.pod.inrupt.com",
     oidcIssuer: "https://frederikbyl.inrupt.net",
      redirectUrl: window.location.href,
    });
    
  }
}

// 1b. Login Redirect. Call session.handleIncomingRedirect() function.
// When redirected after login, finish the process by retrieving session information.
async function handleRedirectAfterLogin() {

    await session.handleIncomingRedirect(window.location.href);
    if (session.info.isLoggedIn) {
      // call upload
      console.log("UPLOADING TO SOLID...")
      await uploadToSolidPod();
      
      session.logout();
     



      //document.getElementById("labelStatus").textContent = "Your session is logged in.";
      //document.getElementById("labelStatus").setAttribute("role", "alert");
      // Enable Create button
      //buttonCreate.disabled=false;
    }
}

// The example has the login redirect back to the index.html.
// This calls the function to process login information.
// If the function is called when not part of the login redirect, the function is a no-op.
handleRedirectAfterLogin();




async function uploadToSolidPod() {
  const podUrl = "https://frederikbyl.inrupt.net";//document.getElementById("PodURL").value;
  const transactionsUrl = `${podUrl}/BE91731073107310/transactions`;
  
  let myTransactionList  = createSolidDataset(); 

  for (let i = 0; i < 10; i++) {
    let moneytransfer = createThing({name: "transfer"+i});
    moneytransfer = addUrl(moneytransfer, RDF.type, "https://schema.org/MoneyTransfer");
    moneytransfer = addStringNoLocale(moneytransfer, "https://schema.org/MoneyTransfer#name", "overschrijving naar de bomma "+i);
    moneytransfer = addStringNoLocale(moneytransfer, "https://schema.org/MoneyTransfer#amount", "102.00");
    
    myTransactionList = setThing(myTransactionList, moneytransfer);

  }
  

  try {
    let savedTransactionList = await saveSolidDatasetAt(
      transactionsUrl,
      myTransactionList,
      { fetch: session.fetch }
    );

  
    // Refetch the Reading List
    savedTransactionList = await getSolidDataset(
      transactionsUrl,
      { fetch: session.fetch } 
    );

    let items = getThingAll(savedTransactionList);

    let listcontent="";
    for (let i = 0; i < items.length; i++) {
      let item = getStringNoLocale(items[i], SCHEMA_INRUPT_EXT.name);
      if (item != null) {
         listcontent += item + "\n";
      }
    }

   // document.getElementById("savedtitles").value = listcontent; 
     alert("Solid link established successfully... data uploaded to pod.");
  } catch (error) {
    console.log(error);
    alert("ERROR: UNAUTHORIZED ACCESS BLOCKED: "+error);
  }
 
}


buttonLogin.onclick = function() {  
  console.log("LOGIN");
  login();
  
};

