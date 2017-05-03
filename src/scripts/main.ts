import {Observable} from 'rxjs';
import {VNode, div, label, input, hr, h1, makeDOMDriver} from '@cycle/dom';
import {DOMSource} from '@cycle/dom/rxjs-typings';
import {run} from '@cycle/rxjs-run';

type Sources = {
    DOM: DOMSource;
}

type Sinks = {
    DOM: Observable<VNode>;
}

function main(sources: Sources): Sinks {
    const input$ = sources.DOM.select('.field').events('input');
    const name$ = Observable.from(input$)
        .map((ev: Event) => (ev.target as HTMLInputElement).value)
        .startWith('');
    const vdom$ = name$.map(name => {
        return div('.well', [
            div('.form-group', [
                label('Name: '),
                input('.field.form-control', {attrs: {type: 'text'}})
            ]),
            hr(),
            h1(`Hello ${name}`)
        ]);
    });

    return {
        DOM: vdom$
    };
}

const drivers = {
    DOM: makeDOMDriver('#app')
};

run(main, drivers);
