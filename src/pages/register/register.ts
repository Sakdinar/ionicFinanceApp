import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController} from 'ionic-angular';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';

import { CustomValidators } from "ng2-validation";

import { DashboardPage } from '../dashboard/dashboard';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import "rxjs/add/operator/debounceTime";
import { Observable } from 'rxjs/Observable';
import { AuthProvider } from '../../providers/auth/auth';


@IonicPage(
  { name: 'RegisterPage' }
)
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  loginPage: any;
  dashPage: any;

  formErrorMessages = {
    name: "",
    password: "",
    confPassword: "",
    email: "",
  }


  validationMessages =
  {
    name: {
      required: "This field is required ",
      minlength: "Full should be at least 3 Characters"
    },
    password: {
      required: "This field is required",
      minlength: "Password should be more than 6 characters"
    },
    confPassword: {
      equalTo: "Passwords must match"
    },
    email: {
      required: "This field is required",
      email: "Please Enter a valid email address"
    },
  }


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private _fb: FormBuilder,
    public alertCtrl: AlertController,
    public auth: AuthProvider,
    public loading: LoadingController
  ) {
    this.dashPage = "DashboardPage"
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
  }


  ngOnInit(): void {

    const name = new FormControl("", [Validators.required, Validators.minLength(3)]);
    const password = new FormControl("", [Validators.required, Validators.minLength(6)]);
    const confPassword = new FormControl("", [CustomValidators.equalTo(password)]);
    const email = new FormControl("", [CustomValidators.email]);

    this.registerForm = this._fb.group({
      name: name,
      email: email,
      password: password,
      confPassword: confPassword
    })


    const formGroup: FormGroup = this.registerForm;
    const controlGroup: [AbstractControl, string][] = [];

    Object.keys(formGroup.controls)
      .forEach((keys: string) => {
        const controls: AbstractControl = formGroup.get(keys);
        controlGroup.push([controls, keys])
      })

    controlGroup.forEach((controlGroupElements): void => {
      const formControl: AbstractControl = controlGroupElements[0];
      const inputName: string = controlGroupElements[1];
      formControl.valueChanges.debounceTime(1500).subscribe(value => {
        this.formErrorMessages[inputName] = this.setMessages(formControl, inputName)
      })
    })
  }

  setMessages(control: AbstractControl, inputName: string) {
    console.log(this.formErrorMessages)
    if ((control.touched || control.dirty) && control.errors) {
      return Object.keys(control.errors).map(keys =>
        this.validationMessages[inputName][keys]
      )
    }
  }


  submit() {
    const loading = this.loading.create({
      content: 'Signing you up...'
    })

    loading.present()
    const user = this.registerForm.getRawValue();
    
    this.auth.signup(user).subscribe((res)=> {
      loading.dismiss();
      this.regSuccess(res, user);
       this.auth.saveNewUser(user);
    }, error=> {
      loading.dismiss();
      this.auth.displayAlt('Error', error)
    })
  }

  regSuccess(result, user) {
    this.auth.displayAlt(result.email, 'Account Created Successfullly');
     this.auth.signin(user).subscribe(res => this.navCtrl.push('DashboardPage'))
  }
}
