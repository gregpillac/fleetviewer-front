import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Place} from '../models/place.model';

@Injectable({
  providedIn: 'root'
})
export class PlaceService {

  private apiUrl = environment.apiBaseUrl + '/api/places';

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste de tous les sites.
   * @returns Un Observable contenant un tableau de sites.
   */
  getPlaces(): Observable<Place[]> {
    return this.http.get<Place[]>(this.apiUrl);
  }

  /**
   * Récupère un véhicule par son identifiant.
   * @param id L'identifiant du véhicule.
   * @returns Un Observable contenant le véhicule.
   */
  getPlaceById(id: number): Observable<Place> {
    return this.http.get<Place>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée un nouveau véhicule.
   * @param place Les données du véhicule à créer.
   * @returns Un Observable contenant le nouveau véhicule.
   */
  createPlace(place: Place): Observable<Place> {
    return this.http.post<Place>(this.apiUrl, place);
  }

  /**
   * Met à jour un véhicule existant.
   * @param place Les données du véhicule à mettre à jour.
   * @returns Un Observable contenant le véhicule mis à jour.
   */
  updatePlace(place: Place): Observable<Place> {
    return this.http.put<Place>(`${this.apiUrl}/${place.id}`, place);
  }

  /**
   * Supprime un véhicule par son identifiant.
   * @param id L'identifiant du véhicule à supprimer.
   * @returns Un Observable.
   */
  deletePlace(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
