import { Component, VERSION } from '@angular/core';
import { defer, from, MonoTypeOperatorFunction, Observable, of, pipe } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ajax} from 'rxjs/ajax'

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  name = 'Angular ' + VERSION.major;
  loadingRequest = () => {
    return pipe(
      finalize(() => console.log('end')),
      onStart(() => console.log('start'))
    );
  };

  ngOnInit() {
    const offset = 10;
    const limit = 100;
    const url = "https://pokeapi.co/api/v2/";
    ajax.getJSON<>(`${url}?offset=${offset}&limit=${offset}`).
  }
}

export function onStart<T>(project: () => void): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) =>
    defer(() => {
      project();
      return source;
    });
}
interface PokemonObject {
  count: number;
  next: string;
  previous: string;
  results: Result[];
}

interface Result {
  name: string;
  url: string;
}