import { Component } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {
  title = 'owlapi-builder';

  examples = [];
  turtleResponse = [];
  owlResponse = '';

  constructor(private dataService:DataService) { }

  ngOnInit(){
    this.dataService.getRequest().subscribe((data: any[]) => {
      for(var i = 0; i < data["item"].length; i ++ ){
        this.examples[i] = data["item"][i]["text"];
      }
    });
  }

  public owlBuilder(n3Response, index){
    this.dataService.owlApiBuilder(n3Response).subscribe((data: any[]) => {
      console.log(data);
      this.owlResponse = data["output"];
      document.getElementsByClassName("turtle_"+index)[0].innerHTML = this.owlResponse;
    })
  }

  public sendTurtle(event, item, index){
    this.dataService.transformTurtle(item).subscribe((data: any[]) => {      
      this.turtleResponse = data;
      this.owlBuilder(this.turtleResponse, index);      
    });
  }
}
