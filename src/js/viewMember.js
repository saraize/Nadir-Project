const firestore = firebase.firestore();
let theMember = [];
let updateMember = {};
$(document).ready(function () {
  $("#payment-track-btn").click(function () {
    document.location.href = "viewMemberFinancial.html";
  });

  $("#personal-track-btn").click(function () {
    document.location.href = "viewMemberComments.html";
  })

  let selectedPersonKey = sessionStorage.getItem('selectedPersonKey');
  console.log("we passed this data to the next screen:" + selectedPersonKey);
  theMember = JSON.parse( sessionStorage.getItem('memberList')).find(x => x.Key ===selectedPersonKey );
  updateMember = JSON.parse( sessionStorage.getItem('memberList')).find(x => x.Key ===selectedPersonKey );
  console.log("this is who we need:" + theMember.Key);
  setFields();
});

function setFields() {//set the fields with info of wanted member
 
    $("#nameTitle").append(theMember.First + " " + theMember.Last);
    $("#first-name").val(theMember.First);
    $("#last-name").val(theMember.Last);
    $("#date").val(theMember.Date.split('-').reverse().join('/'));  // will show in the right way dd/mm/yyyy
    $("#group").val(theMember.Group);
    $("#comments").val(theMember.Comments);
    $("#school").val(theMember.School);
    if(theMember.Grade != null && theMember.Grade != "" )
      $("#grade").val(theMember.Grade +"'");
    $("#phone-num").val([theMember.PhoneNum.slice(0, 3), "-", theMember.PhoneNum.slice(3)].join(''));//add '-' after 3 digit
    if(theMember.ParentPhoneNum != "")
      $("#parent-phone-num").val([theMember.ParentPhoneNum.slice(0, 3), "-", theMember.ParentPhoneNum.slice(3)].join(''));//add '-' after 3 digit
    $("#youth-movement").val(theMember.YouthMovement);
    $("#another-education").val(theMember.AnotherEducation);
    if (theMember.IsInstructor == "false")
      $("#is-instructor").val("לא");
    else
      $("#is-instructor").val("כן");
    if(theMember.IsAdult == "false")
      $("#isAdult").val("לא");
    else
      $("#isAdult").val("כן");
    $("#adultProffesion").val(theMember.AdultProffesion);
  }

function updateMemDetails() { 
  if (theMember) {
    if ($("#edit-btn").text() == "עריכה") { // edit btn was clicked, remove read only for all input
      $("#edit-btn").text("שמור").append("<i class='save icon'></i>");
      $("#first-name").removeAttr("readonly");
      $("#last-name").removeAttr("readonly");
      $("#date").removeAttr("readonly");
      $("#date").attr("type","date");
      $("#date").val(theMember.Date);
      $("#group").removeAttr("readonly");
      $("#group").replaceWith("<select class='ui fluid dropdown' id='group'></select>");
      $("#group").append(displayGroups());
      $("#group").val(theMember.Group);
      $("#comments").removeAttr("readonly");
      $("#school").removeAttr("readonly");
      $("#phone-num").removeAttr("readonly");
      $("#phone-num").attr("type","number");
      $("#phone-num").val(theMember.PhoneNum); 
      $("#grade").removeAttr("readonly");
      $("#grade").replaceWith("<select class='ui fluid dropdown' id='grade'><option value='ז'>ז'</option><option value='ח'>ח'</option><option value='ט'>ט'</option><option value='י'>י'</option><option value='יא'>י''א</option><option value='יב'>י''ב</option></select>");
      $("#grade").val(theMember.Grade);
      $("#parent-phone-num").removeAttr("readonly");
      $("#parent-phone-num").attr("type","number");
      $("#parent-phone-num").val(theMember.ParentPhoneNum); 
      $("#youth-movement").removeAttr("readonly");
      $("#another-education").removeAttr("readonly");
      $("#is-instructor").replaceWith("<select class='ui fluid dropdown' id='is-instructor' ><option value='false'>לא</option><option value='true'>כן</option></select>");
      $("#is-instructor").val(theMember.IsInstructor);
      $("#isAdult").replaceWith("<select required class='ui fluid dropdown' id='isAdult'><option  value='false' selected value>לא</option><option value='true'>כן</option></select>");
      $("#isAdult").val(theMember.IsAdult);
      $("#adultProffesion").removeAttr("readonly");
    }
    else if ($("#edit-btn").text() == "שמור") { //save btn was clicked 
      $("#edit-btn").text("עריכה").append("<i class='edit icon'></i>");
//create new obj for update member
        updateMember.First = $("#first-name").val();
        updateMember.Last = $("#last-name").val();
        updateMember.Date = $("#date").val();
        updateMember.Group = $("#group").val();
        updateMember.Comments = $("#comments").val();
        updateMember.School = $("#school").val();
        updateMember.PhoneNum = $("#phone-num").val();
        updateMember.Grade = $("#grade").val();
        updateMember.ParentPhoneNum = $("#parent-phone-num").val();
        updateMember.YouthMovement = $("#youth-movement").val();
        updateMember.AnotherEducation = $("#another-education").val();
        updateMember.IsInstructor = $("#is-instructor").val();
        updateMember.IsAdult = $("#isAdult").val();
        if(updateMember.IsAdult == "true")
          updateMember.AdultProffesion = $("#adultProffesion").val();
        else
          updateMember.AdultProffesion = "";
        
        if(JSON.stringify(updateMember) !== JSON.stringify(theMember))// if change where make save data in database and session
        updateFunc();

      //return to edit - display
      $("#first-name").attr("readonly", "");
      $("#last-name").attr("readonly", "");
      $("#date").attr("readonly", "");
      $("#group").replaceWith("<input type='text' readonly='' id='group'>"); //disable select 
      $("#group").val(updateMember.Group);
      $("#comments").attr("readonly", "");
      $("#school").attr("readonly", "");
      $("#phone-num").attr("readonly", "");
      $("#phone-num").attr("type","text");
      $("#phone-num").val([theMember.PhoneNum.slice(0, 3), "-", theMember.PhoneNum.slice(3)].join(''));//add '-' after 3 digit
      $("#grade").replaceWith("<input readonly='' id='grade'>");//disable select
      if(updateMember.Grade != null)
        $("#grade").val(updateMember.Grade + "'");
      $("#parent-phone-num").attr("readonly", "");
      $("#parent-phone-num").attr("type","text");
      if(theMember.ParentPhoneNum != "")
        $("#parent-phone-num").val([theMember.ParentPhoneNum.slice(0, 3), "-", theMember.ParentPhoneNum.slice(3)].join(''));//add '-' after 3 digit
      $("#youth-movement").attr("readonly", "");
      $("#another-education").attr("readonly", "");
      $("#is-instructor").replaceWith("<input readonly='' id='is-instructor'>");//disable select
      if (updateMember.IsInstructor == "false")
        $("#is-instructor").val("לא");
      else
        $("#is-instructor").val("כן");
      $("#isAdult").replaceWith("<input readonly='' id='isAdult'>");//disable select
        if (updateMember.IsAdult == "false")
          $("#isAdult").val("לא");
        else
          $("#isAdult").val("כן");
      $("#adultProffesion").attr("readonly", "");
      $("#adultProffesion").val(updateMember.AdultProffesion);

    }
  }
}

function updateFunc(){//update in session and database
  let selectedPersonKey = sessionStorage.getItem('selectedPersonKey');
  let memberList = JSON.parse( sessionStorage.getItem('memberList'));
  let foundIndex = memberList.findIndex(x => x.Key == selectedPersonKey);//inddex of wanted member

        memberList[foundIndex].First = updateMember.First;
        memberList[foundIndex].Last = updateMember.Last;
        memberList[foundIndex].Date = updateMember.Date;
        memberList[foundIndex].Group = updateMember.Group;
        memberList[foundIndex].Comments = updateMember.Comments;
        memberList[foundIndex].School = updateMember.School;
        memberList[foundIndex].PhoneNum = updateMember.PhoneNum;
        memberList[foundIndex].Grade = updateMember.Grade;
        memberList[foundIndex].ParentPhoneNum = updateMember.ParentPhoneNum;
        memberList[foundIndex].YouthMovement = updateMember.YouthMovement;
        memberList[foundIndex].AnotherEducation = updateMember.AnotherEducation;
        memberList[foundIndex].IsInstructor = updateMember.IsInstructor;
        memberList[foundIndex].IsAdult = updateMember.IsAdult;
        memberList[foundIndex].AdultProffesion = updateMember.AdultProffesion;
        sessionStorage.setItem('memberList', JSON.stringify(memberList));//save to session 
        //if name was change need to update title
        $("#nameTitle").replaceWith("<h1 id='nameTitle'>" + memberList[foundIndex].First + " " + memberList[foundIndex].Last + "</h1>");

        //after edit 'theMember' = updateMember : help us to check if other edit was made
        theMember = JSON.parse( sessionStorage.getItem('memberList')).find(x => x.Key ===selectedPersonKey );
        updateMember = JSON.parse( sessionStorage.getItem('memberList')).find(x => x.Key ===selectedPersonKey );


        ///update database
        var updateRef = firestore.collection("Members").doc(selectedPersonKey);

    return updateRef.update({
        First: updateMember.First,
        Last: updateMember.Last,
        Group: updateMember.Group,
        Date: updateMember.Date,
        Comments : updateMember.Comments,
        School : updateMember.School,
        PhoneNum : updateMember.PhoneNum,
        Grade : updateMember.Grade,
        ParentPhoneNum : updateMember.ParentPhoneNum,
        YouthMovement : updateMember.YouthMovement,
        AnotherEducation : updateMember.AnotherEducation,
        IsInstructor : updateMember.IsInstructor,
        IsAdult : updateMember.IsAdult,
        AdultProffesion : updateMember.AdultProffesion
    })
        .then(function () {
            console.log("Document successfully updated!");
        })
        .catch(function (error) {
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
        });
        
}

function displayGroups() {
  let str = "";
  let groups = JSON.parse(sessionStorage.getItem('groupsData'));
  for (let i = 0; i < groups.length; i++)
    str += '<option value="' + groups[i].groupName + '">' + groups[i].groupName + '</option>';
  return str;
}

function deleteFunc(){
  let selectedPersonKey = sessionStorage.getItem('selectedPersonKey');
  let memberList = JSON.parse( sessionStorage.getItem('memberList'));
  let foundIndex = memberList.findIndex(x => x.Key == selectedPersonKey);//inddex of wanted member
  let sumPayment = sumAllPayments(memberList[foundIndex].FinancialMonitoring);

  if(sumPayment != 0){
    $('#dlt-section-fin').modal('show');
    $(".dlt-btn").modal({
      closable: true
    });
    
    $("#payment-btn").click(function () {
      document.location.href = "viewMemberFinancial.html";
    });

    $("#dlt-anyway").click(function () {
       if (foundIndex > -1) {
          memberList.splice(foundIndex, 1);
          sessionStorage.setItem('memberList', JSON.stringify(memberList));//save to session after delete
          firestore.collection("Members").doc(selectedPersonKey).delete().
          then(function(){
            document.location.href = "homePage.html";
          });
        }
        
    });
  }
  else{
    $('#dlt-section').modal('show');
    $(".dlt-btn").modal({
      closable: true
    });

    $("#dlt").click(function () {
       if (foundIndex > -1) {
          memberList.splice(foundIndex, 1);
          sessionStorage.setItem('memberList', JSON.stringify(memberList));//save to session after delete 
          firestore.collection("Members").doc(selectedPersonKey).delete().
          then(function(){
            document.location.href = "homePage.html";
          });
        }
        
    });
  }
}

function sumAllPayments(financialArray) {
  let sum = 0;
  financialArray.forEach(obj => {
    sum += obj.Amount;
  })
  return sum;
}