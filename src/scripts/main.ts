import {Observable} from 'rxjs';
import {VNode, div, makeDOMDriver, button, span, h4} from '@cycle/dom';
import {DOMSource} from '@cycle/dom/rxjs-typings';
import {run} from '@cycle/rxjs-run';
import {BackdropComponent} from './BackdropComponent';

type Sources = {
    DOM: DOMSource;
}

type Sinks = {
    DOM: Observable<VNode>;
}

function main(sources: Sources): Sinks {
    const backdrop = BackdropComponent({
        // DOM: sources.DOM,
        props: {
            transclude$: Observable.of(
                div('.container', [
                    div('.row', [
                        div('.col-sm-6.col-sm-offset-3', [
                            div('.modal-content', [
                                div('.modal-header', [
                                    button('#dialog-close.close', [
                                        span('×')
                                    ]),
                                    h4('.modal-title', 'Modal title')
                                ])
                            ])
                        ])
                    ])
                ])
            ),
            visibility$: Observable.merge(
                sources.DOM.select('#dialog-open').events('click').mapTo(true),
                sources.DOM.select('#dialog-close').events('click').mapTo(false)
            ).startWith(false)
        }
    });

    return {
        DOM: Observable.combineLatest(
            backdrop.DOM,
            (backdropDOM) => {
                return div([
                    div('.container', [
                        button('#dialog-open.btn.btn-default', 'Open'),
                        backdropDOM
                    ])
                ])
            }
        )
    };
}

const drivers = {
    DOM: makeDOMDriver('#app')
};

run(main, drivers);