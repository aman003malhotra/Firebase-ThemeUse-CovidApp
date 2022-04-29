var express = require('express');
const bodyParser= require('body-parser')
var jwt = require('jsonwebtoken');


// Defining the local storage
if(typeof localStorage === 'undefined' || localStorage === null){
    const LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./loginInfo');
  }
    
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

var app = express()

app.use(bodyParser.urlencoded({ extended: true }))

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


app.get('/', (req,res)=>{
    res.render('index');
})

let db=admin.firestore();
let patient=db.collection('patient');
let adminLogin=db.collection('admin');
let patientAppointment=db.collection('patientAppointment');
let assesment=db.collection('assesment');
let appointments=db.collection('appointments');

// app.post('/data',async (req,res)=>{
// let docRef=a.doc(req.body.user.name)
// await docRef.set({
// hobby: req.body.user.hobby,
// age: req.body.user.age,
// });
// res.send('done');
// })

app.get('/signup',async (req,res)=>{
    res.render('signup');
})

app.post('/signup', async (req,res)=>{
    console.log("Signup");
    let docRef=patient.doc(req.body.email)
    await docRef.set({
        password: req.body.password,
        });
    console.log(req.body);
    res.render('patient-signin');
})


app.get('/patient-signin', (req,res)=>{
    res.render('patient-signin', {message:null})
})

app.post('/patient-signin', async (req,res)=>{
    console.log("patietn-signin");
    console.log(req.body);
    const patient_info = await db.collection('patient').doc(req.body.email).get();
    if (patient_info.data()){
        console.log("Patient exists")
        if (patient_info.data().password == req.body.password){
            console.log("Patient logged in")
            var lgToken = jwt.sign({userID: req.body.email}, 'loginToken');
            localStorage.setItem('userToken', lgToken);
            localStorage.setItem('loginUserEmail', req.body.email);
            res.render('patientportal');
        }
        else{
            console.log("Wrong Password")
            res.render('patient-signin', {message:"Wrong Password"})
        }
    }
    else{
        console.log("User does not exist")
        res.render('patient-signin', {message:"User Does not exists.Please SIGNUP"})
    }
});


app.post('/patient-logout', (req,res)=>{
    console.log('Patient-loggedout')
    localStorage.removeItem('userToken');
    localStorage.removeItem('loginUserEmail');
    res.render('index');
})

app.get('/patientportal', (req,res)=>{
    res.render('patientportal')
})

app.get('/patient-appointment', (req,res)=>{
    res.render('patient-appointment', {message:null})
})


app.post('/patient-appointment', async (req,res)=>{
    loggedInUser = localStorage.getItem('loginUserEmail')
    let docRef=patientAppointment.doc(loggedInUser)
    await docRef.set({
        name: req.body.name,
        contact:req.body.phone,
        email:req.body.email,
        addMessage:req.body.message,
        date:req.body.email
        });
    res.render('patient-appointment', {message:"Thank You, Your response is recorded"});
});

app.get('/assesment', (req,res)=>{
    res.render('assesment', {message:null})
})


app.post('/assesment', async(req,res)=>{
    console.log(req.body)
    loggedInUser = localStorage.getItem('loginUserEmail')
    let docRef=assesment.doc(loggedInUser)
    await docRef.set({
        firstname:req.body.firstname,
        lastname: req.body.lastname,
        sex:req.body.sex,
        age:req.body.age,
        prevDiagnosed:req.body.prevDiagnosed,
        symptoms1:req.body.symptoms1,
        symptoms2:req.body.symptoms2,
        respIllness:req.body.respIllness,
        abroadVisit:req.body.abroadVisit,
        pubVehUsed:req.body.pubVehUsed,
        visitRedZone:req.body.visitRedZone,
        closeContactwithSymptomatic:req.body.closeContactwithSymptomatic,
        closeContactPatient:req.body.closeContactPatient,
        consulOrTest:req.body.consulOrTest,
        medicine:req.body.medicine,
        });
    res.render('assesment', {message:"Assesment Sent to Admin.Thank You"})
})

app.get('/admin-signin', (req,res)=>{
    console.log('admin-signin')
    res.render('admin-signin', {message:null})
})

app.post('/admin-signin', async (req,res)=>{
    console.log(req.body);
    const admin_info = await db.collection('admin').doc(req.body.email).get();
    if (admin_info.data()){
        console.log("Admin exists")
        if (admin_info.data().password == req.body.password){
            console.log("Admin logged in")
            var lgToken = jwt.sign({userID: req.body.email}, 'loginToken');
            localStorage.setItem('userToken', lgToken);
            localStorage.setItem('loginUserEmail', req.body.email);
            res.redirect('/adminportal');
        }
        else{
            console.log("Wrong Password")
            res.render('admin-signin', {message:"Wrong Password"})

        }
    }
    else{
        console.log("Wrong Email Address")
        res.render('admin-signin', {message:"Wrong Email Address"})
    }
})



app.get('/adminportal', async (req,res)=>{
    const appointments = await db.collection('appointments').get()
    const requestedAppointments = await db.collection('patientAppointment').get()
    const submittedAssesments = await db.collection('assesment').get()

    const appointmentsNum = appointments.docs.length
    const requestedAppointmentsNum = requestedAppointments.docs.length
    const submittedAssesmentsNum = submittedAssesments.docs.length
    res.render('adminportal', {appointmentsNum:appointmentsNum,requestedAppointmentsNum:requestedAppointmentsNum,submittedAssesmentsNum:submittedAssesmentsNum})
})

app.post('/admin-logout', (req,res)=>{
    console.log("Admin Logout");
    localStorage.removeItem('userToken');
    localStorage.removeItem('loginUserEmail');
    res.render('index')
})

app.get('/admin-appointment', async (req,res)=>{
    let appointmentList=[]
    const appointments = await db.collection('appointments').get()
    if (appointments.docs.length > 0) {
        for (const appointment of appointments.docs) {
            appointmentList.push(appointment.data())
    }}
    console.log(appointmentList)
    res.render('admin-appointment',{appointmentList:appointmentList})
})

app.get('/requestedAppointments', async(req,res)=>{
    let requestedappointmentList=[]
    const requestedAppointments = await db.collection('patientAppointment').get()
    if (requestedAppointments.docs.length > 0) {
        for (const requestedAppointment of requestedAppointments.docs) {
            requestedappointmentList.push(requestedAppointment.data())
    }}
    console.log(requestedappointmentList)
    res.render('requestedAppointments', {requestedappointmentList:requestedappointmentList})
})

app.get('/add-appointment', (req,res)=>{
    res.render('add-appointment')
})

app.post('/add-appointment', async (req,res)=>{
    console.log(req.body)
    let docRef=appointments.doc(req.body.apptID)
    await docRef.set({
        apptID: req.body.apptID,
        patientName: req.body.patientName,
        DoctorName: req.body.doctor,
        date: req.body.date,
        time: req.body.time,
        patientEmail: req.body.patientEmail,
        patientContact: req.body.patientContact,
        Message: req.body.Message 
    })
    res.send("Done")
    res.render('add-appointment')
})

app.get('/submittedAssesments', async (req,res)=>{
    let submittedAssesmentsList=[]
    const submittedAssesments = await db.collection('assesment').get()
    if (submittedAssesments.docs.length > 0) {
        for (const submittedAssesment of submittedAssesments.docs) {
            submittedAssesmentsList.push(submittedAssesment.data())
    }}
    console.log(submittedAssesmentsList)
    res.render('submittedAssesments', {submittedAssesmentsList:submittedAssesmentsList})
})




app.listen(3000, ()=> console.log('App is listening on url http://localhost:3000'));