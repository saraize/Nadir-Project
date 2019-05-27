const firestore = firebase.firestore();
const selectedMemberKey = sessionStorage.getItem('selectedPersonKey');
const selectedMember = JSON.parse(sessionStorage.getItem('memberList')).find(member => member.Key === selectedMemberKey);
let selectedPaymentToRemove = null;

/**When document is ready */
$(document).ready(function () {
  $('.ui.accordion').accordion(); //activate acordion effect
  $("#datePicker").attr("value", todayDate()); //set datePicker to current date automaticly
  let name = "מעקב כספי: " + selectedMember.First + " " + selectedMember.Last;
  $("#namePlaceHoler").text(name); //place selectedMember name at the header

  $("#modalYes").click(deletePayment);
  $("#modalNo").click(function () {
    $('.mini.modal').modal('hide');
  });
  //setting functionality
  $("#addPaymentForm").submit(addPayment);
  $("#charge").change(updatePaymentMethodDropDown);
  fill_table();
});

/**Adding new payment to member */
function addPayment(e) {
  e.preventDefault();
  const $amount = $("#amount").val() * $("#charge").val(); //if charge = "חיוב" -> val is 1. if charge = "זיכוי" -> val = -1
  let $payMethod;
  /*if charge value is "1" (חיוב) -> paymentMethod is not needed then set its value to empty string*/
  if ($("#charge").val() == 1) {
    $payMethod = "";
  } else {
    $payMethod = $("#paymentMethod").val();
  }

  let id = uuidv4();
  const paymentObj = {
    Details: $("#details").val(),
    Date: $("#datePicker").val(),
    Amount: $amount,
    Charge: $("#charge").val(),
    PaymentMethod: $payMethod,
    Id: id,
  };


  if (getFinancialArrray().length == 0)
    createTable();

  updateDataBase(paymentObj);
  updateSessionStorage(paymentObj);
  insertToTable(paymentObj);
  sortTable();

  /**clear fields */
  $("#details").val("");
  $("#datePicker").attr("value", todayDate());
  $("#charge").val("");
  $("#amount").val("");
  $("#paymentMethod").val("");
}

/**Generating id for each payment */
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


/*filling table of payments*/
function fill_table() {
  financial_data = getFinancialArrray();
  if (financial_data.length != 0)
    createTable();
  financial_data.forEach(element => {
    insertToTable(element);
    
  });
  if(financial_data.length != 0)
    sortTable();
}

function createTable() {
  let tableStr = '<table class="ui compact striped table" id="financial_table">'
  tableStr += '<thead><tr><th></th><th>פרטים</th><th>תאריך</th><th>אופן תשלום</th><th>חובה</th><th>זכות</th></tr>'
  tableStr += '</thead><tbody></tbody></table>';
  $("#tablePlaceHolder").append(tableStr);
}

/*inserting new payment into table */
function insertToTable(obj) {
  const $table = $("#financial_table");
  let html = '<tr><td><i class = "trash red icon" id ="' + obj.Id + '"></td>';
  html += '<td>' + obj.Details + '</td>';
  html += '<td>' + obj.Date.split('-').reverse().join('/') + '</td>';
  html += '<td>' + obj.PaymentMethod + '</td>';
  if (obj.Amount > 0) {
    html += '<td class = "vmf-negative">' + obj.Amount + '</td><td></td>';
  } else {
    html += '<td></td><td class = "vmf-positive" dir="ltr">' + obj.Amount + '</td>';
  }
  html += "</tr>"
  updateSum(obj.Amount);
  $table.append(html);
  setRemoveLisetener(obj.Id);
}

/*for each button next to payment row, set remove listener*/
function setRemoveLisetener(id) {
  $("#" + id).click(function (e) {
    $('.mini.modal').modal('show');
    let paymentToRemove = getPayment(id);
    let removeFromSum = parseInt(getAmount(id)) * -1;
    selectedPaymentToRemove = {
      tr: $(this).closest('tr'),
      paymentToRemove: paymentToRemove,
      removeFromSum: removeFromSum,
      id: id
    }

  })

}

function deletePayment() {
  console.log(selectedPaymentToRemove);
  removeFromDataBase(selectedPaymentToRemove.paymentToRemove);
  removeFromSession(selectedPaymentToRemove.id);
  updateSum(selectedPaymentToRemove.removeFromSum);
  selectedPaymentToRemove.tr.remove();
  let len = getFinancialArrray().length;
  if (len == 0){
    //if the FinancialTracking array is empty
    $("#financial_table").remove();
  }

  $('.mini.modal').modal('hide')
}


/**return amount of payment by id */
function getAmount(id) {
  return getFinancialArrray().find(obj => {
    return obj.Id === id;
  }).Amount;
}

/**Updateing DataBase And Session Functions */
function updateSessionStorage(paymentObj) {
  list = JSON.parse(sessionStorage.getItem('memberList'))
  list.find(member => member.Key === selectedMemberKey).FinancialMonitoring.push(paymentObj);
  sessionStorage.setItem('memberList', JSON.stringify(list));
}


function removeFromSession(id) {
  let memList = JSON.parse(sessionStorage.getItem('memberList'));
  let index = memList.findIndex(i => i.Key === selectedMemberKey);
  memList[index].FinancialMonitoring = memList[index].FinancialMonitoring.filter(pay => pay.Id !== id);
  sessionStorage.setItem('memberList', JSON.stringify(memList));
}


function updateDataBase(paymentObj) {
  firestore.collection("Members").doc(selectedMemberKey).update({
    FinancialMonitoring: firebase.firestore.FieldValue.arrayUnion(paymentObj)
  });
}

/**return payment obj to remove in database */
function getPayment(id) {
  return getFinancialArrray().find(obj => {
    return obj.Id === id;
  })
}

function removeFromDataBase(paymentObj) {
  firestore.collection("Members").doc(selectedMemberKey).update({
    FinancialMonitoring: firebase.firestore.FieldValue.arrayRemove(paymentObj)
  });
}
/**Updateing DataBase And Session Functions */

/*update overall sum when adding new payment*/
function updateSum(amount) {
  let $sum = $("#summaryAmount")
  let newSum = parseInt($sum.text()) + amount;
  if (newSum > 0)
    $sum.removeClass().addClass("vmf-negative");
  else
    $sum.removeClass().addClass("vmf-positive");

  $sum.text(newSum);
}


function getFinancialArrray() {
  return JSON.parse(sessionStorage.getItem('memberList')).find(member => member.Key === selectedMemberKey).FinancialMonitoring;
}



/*When charge value is '-1' (זיכוי) then show paymentMenthod drop down, o.w hide it*/
function updatePaymentMethodDropDown() {
  let elm = $("#charge");
  if (elm.val() === "-1") {
    $("#formSecondRow").removeClass().addClass("three fields");
    $("#paymentMethod").prop('required', true)
    $("#payMethodDiv").show();
  } else {
    $("#formSecondRow").removeClass().addClass("two fields");
    $("#paymentMethod").prop('required', false)
    $("#payMethodDiv").hide();
  }
}


function todayDate() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd;
  return today
}


function sortTable() {
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("financial_table");
  switching = true;
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 1; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("td")[2];
      
      y = rows[i + 1].getElementsByTagName("td")[2];
      //check if the two rows should switch place:
      
      if ((x.innerHTML).split("").reverse().join("") > y.innerHTML.split("").reverse().join("")) {
        //if so, mark as a switch and break the loop:
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}

