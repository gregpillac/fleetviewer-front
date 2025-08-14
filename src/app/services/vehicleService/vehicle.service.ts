import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Vehicle} from '../../models/vehicle';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  private apiUrl = environment.apiBaseUrl + '/api/vehicles';

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste de tous les véhicules.
   * @returns Un Observable contenant un tableau de véhicules.
   */
  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.apiUrl);
  }

  /**
   * Récupère un véhicule par son identifiant.
   * @param id L'identifiant du véhicule.
   * @returns Un Observable contenant le véhicule.
   */
  getVehicleById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée un nouveau véhicule.
   * @param vehicle Les données du véhicule à créer.
   * @returns Un Observable contenant le nouveau véhicule.
   */
  createVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicle);
  }

  /**
   * Met à jour un véhicule existant.
   * @param vehicleId
   * @param vehicle Les données du véhicule à mettre à jour.
   * @returns Un Observable contenant le véhicule mis à jour.
   */
  updateVehicle(vehicleId: number, vehicle: Vehicle): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiUrl}/${vehicleId}`, vehicle);
  }

  /**
   * Supprime un véhicule par son identifiant.
   * @param id L'identifiant du véhicule à supprimer.
   * @returns Un Observable.
   */
  deleteVehicle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
