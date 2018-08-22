import { Component, OnInit } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { AddPlacePage } from '../add-place/add-place';
import { Place } from '../../models/place';
import { PlacesService } from '../../services/places';
import { PlacePage } from '../place/place';
import { File } from '@ionic-native/file';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  addPlacePage = AddPlacePage;
  places: Place[] = [];

  constructor(public modalCtrl: ModalController, private placesService: PlacesService, private file: File) {}

  ngOnInit() {
    console.log('HomePage.ngOnInit');
    this.placesService.fetchPlaces()
    .then((places: Place[]) => this.places = places);
  }

  ionViewWillEnter() {
    console.log('HomePage.ionViewWillEnter');
    this.places = this.placesService.loadPlaces();
    if (this.places.length > 0) {
      const place = this.places[0];
      const path = place.imageNativeUrl.replace(/[^\/]*$/, '');
      const fileName = place.imageNativeUrl.replace(/^.*[\\\/]/, '');
      console.log('HomePage.path: ' + path);
      console.log('HomePage.fileName: ' + fileName);
      this.file.checkFile(path, fileName)
      .then(result => console.log('checkFile success', result))
      .catch(err => console.error('checkFile error', JSON.stringify(err)));
    }
  }

  onOpenPlace(place: Place, index: number) {
    const modal = this.modalCtrl.create(PlacePage, {place: place, index: index});
    modal.present();
  }
}
