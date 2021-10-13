import { Component, VERSION } from '@angular/core';
import {
  BehaviorSubject,
  defer,
  EMPTY,
  from,
  MonoTypeOperatorFunction,
  Observable,
  of,
  pipe,
  Subject
} from 'rxjs';
import {
  exhaustMap,
  finalize,
  map,
  mergeAll,
  mergeMap,
  switchMap,
  toArray
} from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  name = 'Angular ' + VERSION.major;
  pokemonList = new BehaviorSubject<Result[]>([]);
  pokemonList2$ = new BehaviorSubject<Pokemon[]>([]);
  offset$ = new BehaviorSubject<number>(0);
  limit$ = new BehaviorSubject<number>(12);
  url = 'https://pokeapi.co/api/v2/pokemon';
  paginator = new BehaviorSubject<{ limit: number; offset: number }>({
    limit: 12,
    offset: 0
  });

  loading: boolean;
  pokemon$ = this.paginator.pipe(
    switchMap(paginator =>
      ajax.getJSON(
        `${this.url}?offset=${this.paginator.getValue().offset}&limit=${
          this.paginator.getValue().limit
        }`
      )
    )
  );

  ngOnInit() {
    this.queryPokemon().subscribe((res: Pokemon[]) => {
      this.pokemonList2$.next(res);
      this.loading = false;
    });
  }

  nextPage() {
    this.loading = true;
    this.paginator.next({
      ...this.paginator.getValue(),
      offset: this.paginator.getValue().offset + this.paginator.getValue().limit
    });
  }
  backPage() {
    this.loading = true;
    this.paginator.next({
      ...this.paginator.getValue(),
      offset: this.paginator.getValue().offset - this.paginator.getValue().limit
    });
  }

  queryPokemon() {
    return this.pokemon$.pipe(
      switchMap((response: PokemonObject) => {
        const urlList$ = response.results.map(
          result => ajax.getJSON(result.url) as Observable<Pokemon>
        );
        return from(urlList$).pipe(
          mergeAll(),
          toArray()
        );
      })
    );

    ajax
      .getJSON<PokemonObject>(
        `${
          this.url
        }?offset=${this.offset$.getValue()}&limit=${this.limit$.getValue()}`
      )
      .pipe(
        map(res => {
          this.pokemonList2$.next([]);
          return res.results;
        }),
        switchMap(res => {
          return res.map(item => {
            return ajax.getJSON<Pokemon>(item.url).pipe(
              map(response => {
                console.log({ response });
                this.pokemonList2$.next([
                  ...this.pokemonList2$.getValue(),
                  response
                ]);
              })
            );
          });
        })
      )
      .subscribe(res => {});
  }

  loadingRequest = () => {
    return pipe(
      finalize(() => console.log('end')),
      onStart(() => console.log('start'))
    );
  };
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

interface Pokemon {
  abilities: Ability2[];
  base_experience: number;
  forms: Ability[];
  game_indices: Gameindex[];
  height: number;
  held_items: any[];
  id: number;
  is_default: boolean;
  location_area_encounters: string;
  moves: Move[];
  name: string;
  order: number;
  past_types: any[];
  species: Ability;
  sprites: Sprites;
  stats: Stat[];
  types: Type[];
  weight: number;
}

interface Type {
  slot: number;
  type: Ability;
}

interface Stat {
  base_stat: number;
  effort: number;
  stat: Ability;
}

interface Sprites {
  back_default: string;
  back_female?: any;
  back_shiny: string;
  back_shiny_female?: any;
  front_default: string;
  front_female?: any;
  front_shiny: string;
  front_shiny_female?: any;
  other: Other;
  versions: Versions;
}

interface Versions {
  'generation-i': Generationi;
  'generation-ii': Generationii;
  'generation-iii': Generationiii;
  'generation-iv': Generationiv;
  'generation-v': Generationv;
  'generation-vi': Generationvi;
  'generation-vii': Generationvii;
  'generation-viii': Generationviii;
}

interface Generationviii {
  icons: Dreamworld;
}

interface Generationvii {
  icons: Dreamworld;
  'ultra-sun-ultra-moon': Omegarubyalphasapphire;
}

interface Generationvi {
  'omegaruby-alphasapphire': Omegarubyalphasapphire;
  'x-y': Omegarubyalphasapphire;
}

interface Omegarubyalphasapphire {
  front_default: string;
  front_female?: any;
  front_shiny: string;
  front_shiny_female?: any;
}

interface Generationv {
  'black-white': Blackwhite;
}

interface Blackwhite {
  animated: Diamondpearl;
  back_default: string;
  back_female?: any;
  back_shiny: string;
  back_shiny_female?: any;
  front_default: string;
  front_female?: any;
  front_shiny: string;
  front_shiny_female?: any;
}

interface Generationiv {
  'diamond-pearl': Diamondpearl;
  'heartgold-soulsilver': Diamondpearl;
  platinum: Diamondpearl;
}

interface Diamondpearl {
  back_default: string;
  back_female?: any;
  back_shiny: string;
  back_shiny_female?: any;
  front_default: string;
  front_female?: any;
  front_shiny: string;
  front_shiny_female?: any;
}

interface Generationiii {
  emerald: Emerald;
  'firered-leafgreen': Fireredleafgreen;
  'ruby-sapphire': Crystal;
}

interface Fireredleafgreen {
  back_default?: any;
  back_shiny?: any;
  front_default?: any;
  front_shiny?: any;
}

interface Emerald {
  front_default: string;
  front_shiny: string;
}

interface Generationii {
  crystal: Crystal;
  gold: Crystal;
  silver: Crystal;
}

interface Crystal {
  back_default: string;
  back_shiny: string;
  front_default: string;
  front_shiny: string;
}

interface Generationi {
  'red-blue': Redblue;
  yellow: Redblue;
}

interface Redblue {
  back_default?: any;
  back_gray?: any;
  front_default?: any;
  front_gray?: any;
}

interface Other {
  dream_world: Dreamworld;
  'official-artwork': Officialartwork;
}

interface Officialartwork {
  front_default: string;
}

interface Dreamworld {
  front_default: string;
  front_female?: any;
}

interface Move {
  move: Ability;
  version_group_details: Versiongroupdetail[];
}

interface Versiongroupdetail {
  level_learned_at: number;
  move_learn_method: Ability;
  version_group: Ability;
}

interface Gameindex {
  game_index: number;
  version: Ability;
}

interface Ability2 {
  ability: Ability;
  is_hidden: boolean;
  slot: number;
}

interface Ability {
  name: string;
  url: string;
}
