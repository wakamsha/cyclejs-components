import {Observable} from 'rxjs';
import {VNode, div, makeDOMDriver, button, span, h4, h2, hr, pre, code, p} from '@cycle/dom';
import {DOMSource} from '@cycle/dom/rxjs-typings';
import {run} from '@cycle/rxjs-run';
import {BackdropComponent} from './BackdropComponent';
import {TimerGaugeComponent} from './TimerGaugeComponent';

type Sources = {
    DOM: DOMSource;
}

type Sinks = {
    DOM: Observable<VNode>;
}

function main(sources: Sources): Sinks {
    const backdrop = BackdropComponent({
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
                                ]),
                                div('.modal-body', [
                                    p('Vivamus suscipit tortor eget felis porttitor volutpat. Donec sollicitudin molestie malesuada. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus.')
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

    const timerGauge = TimerGaugeComponent({
        props: {
            maxTime$: Observable.of(10000),
            alertTime: 3000,
            active$: Observable.merge(
                sources.DOM.select('#timer-gauge-play').events('click').mapTo(true),
                sources.DOM.select('#timer-gauge-pause').events('click').mapTo(false)
            ),
            reset$: sources.DOM.select('#timer-gauge-reset').events('click').mapTo(undefined)
        }
    });

    return {
        DOM: Observable.combineLatest(
            backdrop.DOM,
            timerGauge.DOM,
            timerGauge.timeSpent$,
            timerGauge.isActive$,
            (backdropDOM, timerGaugeDOM, timeSpent, isActive) => {
                return div('.container', [
                    h2('.page-header', 'Backdrop'),
                    div([
                        button('#dialog-open.btn.btn-default', 'Open'),
                        backdropDOM
                    ]),
                    h2('.page-header', 'Timer Gauge'),
                    div('.row', [
                        div('.col-sm-6', [
                            timerGaugeDOM,
                            hr(),
                            div('.btn-group', [
                                button('#timer-gauge-play.btn.btn-default', 'Play'),
                                button('#timer-gauge-pause.btn.btn-default', 'Pause'),
                                button('#timer-gauge-reset.btn.btn-default', 'Reset')
                            ])
                        ]),
                        div('.col-sm-6', [
                            pre([
                                code([
                                    JSON.stringify({
                                        isActive: isActive,
                                        result: timeSpent
                                    }, null, 2)
                                ])
                            ])
                        ])
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
