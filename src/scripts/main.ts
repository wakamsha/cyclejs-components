import {Observable} from 'rxjs';
import {VNode, div, makeDOMDriver, button, span, h4, h2, hr, pre, code, p, img} from '@cycle/dom';
import {DOMSource} from '@cycle/dom/rxjs-typings';
import {run} from '@cycle/rxjs-run';
import {ModalComponent} from './components/ModalComponent';
import {CountdownTimerComponent} from './components/CountdownTimerComponent';

type Sources = {
    DOM: DOMSource;
}

type Sinks = {
    DOM: Observable<VNode>;
}

function main(sources: Sources): Sinks {
    const modal1 = ModalComponent({
        props: {
            content$: Observable.of(
                div('.container', [
                    div('.row', [
                        div('.col-sm-6.col-sm-offset-3', [
                            div('.panel.panel-default', [
                                div('.panel-heading', [
                                    button('#dialog-close1.close', [
                                        span('×')
                                    ]),
                                    h4('.panel-title', 'Dummy text')
                                ]),
                                div('.panel-body', [
                                    p('Vivamus suscipit tortor eget felis porttitor volutpat. Donec sollicitudin molestie malesuada. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus.')
                                ])
                            ])
                        ])
                    ])
                ])
            ),
            visibility$: Observable.merge(
                sources.DOM.select('#dialog-open1').events('click').mapTo(true),
                sources.DOM.select('#dialog-close1').events('click').mapTo(false)
            ).startWith(false)
        }
    });

    const modal2 = ModalComponent({
        props: {
            content$: Observable.of(
                div('.container', [
                    div('.row', [
                        div('.col-sm-6.col-sm-offset-3', [
                            div('.panel.panel-primary', [
                                div('.panel-heading', [
                                    button('#dialog-close2.close', [
                                        span('×')
                                    ]),
                                    h4('.panel-title', 'Random image')
                                ]),
                                div('.panel-body.text-center', [
                                    img('.img-thumbnail', {attrs: {src: 'http://lorempixel.com/480/270/sports/'}})
                                ])
                            ])
                        ])
                    ])
                ])
            ),
            visibility$: Observable.merge(
                sources.DOM.select('#dialog-open2').events('click').mapTo(true),
                sources.DOM.select('#dialog-close2').events('click').mapTo(false)
            ).startWith(false)
        }
    });

    const countdownTimer = CountdownTimerComponent({
        props: {
            maxTime$: Observable.of(5000),
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
            modal1.DOM,
            modal2.DOM,
            countdownTimer.DOM,
            countdownTimer.timeSpent$,
            countdownTimer.isActive$,
            (modalDOM1, modalDOM2, timerGaugeDOM, timeSpent, isActive) => {
                return div('.container', [
                    h2('.page-header', 'Modal'),
                    div([
                        div('.btn-group', [
                            button('#dialog-open1.btn.btn-default', 'Open 1'),
                            button('#dialog-open2.btn.btn-default', 'Open 2'),
                        ]),
                        modalDOM1,
                        modalDOM2,
                    ]),
                    h2('.page-header', 'Countdown Timer'),
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
