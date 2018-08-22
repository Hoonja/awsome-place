import { Component } from '@angular/core';
import { IonicPage, ModalController, LoadingController, ToastController, NavController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { SetLocationPage } from '../set-location/set-location';
import { Location } from '../../models/locations';
import { Geolocation } from '@ionic-native/geolocation';
import { Camera } from '@ionic-native/camera';
import { File, Entry, FileError } from '@ionic-native/file';
import { normalizeURL } from 'ionic-angular';
import { PlacesService } from '../../services/places';


declare var cordova: any;

@IonicPage()
@Component({
  selector: 'page-add-place',
  templateUrl: 'add-place.html',
})
export class AddPlacePage {
  location: Location = {
    lat: 40.7524324,
    lng: -73.9759827
  };
  locationIsSet = false;
  imageUrl = '';
  imageNativeUrl = '';

  constructor(
    private modalCtrl: ModalController,
    private geoLocation: Geolocation,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private camera: Camera,
    private file: File,
    private placesService: PlacesService,
    private navCtrl: NavController
  ) {}

  onSubmit(form: NgForm) {
    console.log(form.value);
    this.placesService.addPlace(form.value.title, form.value.description, this.location, this.imageUrl, this.imageNativeUrl);
    form.reset();
    this.location = {
      lat: 40.7524324,
      lng: -73.9759827
    };
    this.imageUrl = '';
    this.imageNativeUrl = '';
    this.locationIsSet = false;
    this.navCtrl.pop();
  }

  onOpenMap() {
    const modal = this.modalCtrl.create(SetLocationPage, {location: this.location, isSet: this.locationIsSet});
    modal.present();
    modal.onDidDismiss(data => {
      console.log('modal.onDidDismiss', data);
      if (data) {
        this.location = data.location;
        this.locationIsSet = true;
      } else {

      }
    })
  }

  onLocate() {
    const loader = this.loadingCtrl.create({
      content: 'Getting your location...'
    });
    loader.present();
    this.geoLocation.getCurrentPosition()
      .then(location => {
        loader.dismiss();
        console.log(location);
        this.location.lat = location.coords.latitude;
        this.location.lng = location.coords.longitude;
        this.locationIsSet = true;
      })
      .catch(err => {
        loader.dismiss();
        const toast = this.toastCtrl.create({
          message: 'Could not get location, please pick it manually',
          duration: 2500
        });
        toast.present();
        console.error(err);
      });
  }

  onTakePhoto() {
    this.camera.getPicture({
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true
    })
      .then(imageData => {
        const currentName = imageData.replace(/^.*[\\\/]/, '');
        const path = imageData.replace(/[^\/]*$/, '');
        const newFileName = new Date().getUTCMilliseconds() + '.jpg';
        this.file.moveFile(path, currentName, cordova.file.dataDirectory, newFileName)
        .then((data: Entry) => {
          console.log('nativeURL      : ' + data.nativeURL);
          console.log('normalizedURL  : ' + normalizeURL(data.nativeURL));
          console.log('toURL          : ' + data.toURL());
          console.log('InternalURL    : ' + data.toInternalURL());
          this.imageNativeUrl = data.nativeURL;
          this.imageUrl = normalizeURL(data.nativeURL);
          // this.imageUrl = data.toInternalURL();
          this.camera.cleanup();
        })
        .catch((err: FileError) => {
          this.imageUrl = '';
          this.imageNativeUrl = '';
          const toast = this.toastCtrl.create({
            message: 'Could not save the image.Plase try agaiin',
            duration: 2500
          });
          toast.present();
          this.camera.cleanup();
        });
        // this.imageUrl = normalizedUrl;
      })
      .catch(err => {
        const toast = this.toastCtrl.create({
          message: 'Could not save the image.Plase try agaiin',
          duration: 2500
        });
        toast.present();
      });
  }
}
