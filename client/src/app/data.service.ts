import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  private REST_API_SERVER = "http://localhost:9090";

  constructor(private httpClient: HttpClient) { }

  public getRequest(){
    return this.httpClient.get(this.REST_API_SERVER+"/api/getOntolexDOM");
  }

  public transformTurtle(item){
    return this.httpClient.post<any>(this.REST_API_SERVER+"/api/parseTurtle", { turtleData : item });
  }

  public owlApiBuilder(n3ToOwl){
    return this.httpClient.post<any>(this.REST_API_SERVER+"/api/generateOwlApi", { n3Data : n3ToOwl });
  }
}
