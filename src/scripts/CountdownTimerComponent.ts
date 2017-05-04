import {Observable} from 'rxjs';
import {VNode, div, span} from '@cycle/dom';

type Sources = {
    props: {
        maxTime$: Observable<number>;
        alertTime: number;
        active$: Observable<boolean>;
        reset$: Observable<undefined>;
    }
}

type Sinks = {
    isActive$: Observable<boolean>;
    timeSpent$: Observable<number>;
    DOM: Observable<VNode>;
}

class State {
    public isPlaying = false;
    public timeSpent = 0;

    private lastTime = -1;

    public tick(): State {
        const now = Date.now();
        if (this.lastTime > 0) {
            this.timeSpent += (now - this.lastTime);
        }
        this.lastTime = now;
        return this;
    }

    public setPlaying(playing: boolean): State {
        this.isPlaying = playing;
        if (!this.isPlaying) {
            this.lastTime = -1;
        }
        return this;
    }

    public reset(): State {
        this.isPlaying = false;
        this.timeSpent = 0;
        this.lastTime = -1;
        return this;
    }
}

function digit(n: number): string {
    return (`0${n}`).substr(-2);
}

function render({maxTime, time, alertTime}: {alertTime: number, maxTime: number, time: number}): VNode {
    const min = digit(Math.floor(time / 60000));
    const sec = digit(Math.floor(time / 1000) % 60);
    const msec = digit(Math.floor(Math.floor(time / 10)));
    const ratio = time / maxTime;
    const isAlert = time < alertTime;

    return div('.countdown-timer', [
        div('.countdown-timer__col.countdown-timer__col--progress', [
            div('.progress', [
                div('.progress-bar', {
                    style: {width: `${ratio * 100}%`},
                    class: {
                        'progress-bar-danger': isAlert,
                    }
                })
            ])
        ]),
        div('.countdown-timer__col', [
            span('.countdown-timer__counter', {
                class: {
                    'countdown-timer__counter--danger': isAlert
                }
            }, `${min}:${sec}:${msec}`)
        ])
    ]);
}

export function CountdownTimerComponent({props}: Sources): Sinks {
    const active$ = props.active$;

    const model$ = Observable.merge(
        // tick$
        Observable
            .merge(
                active$,
                props.reset$ ? props.reset$.mapTo(false) : Observable.never()
            )
            .switchMap((active: boolean) => active ? Observable.interval(33) : Observable.of(0))
            .map((_) => (acc: State) => acc.tick()),
        // setPlaying$
        active$.map((playing: boolean) => (acc: State) => acc.setPlaying(playing)),
        // reset$
        props.reset$ ? props.reset$.map((_) => (acc: State) => acc.reset()) : Observable.never()
    ).startWith(
        (seed: State) => seed
    ).scan(
        (acc: State, fn: (acc: State) => State) => fn(acc), new State()
    );

    const vdom$ = Observable.combineLatest(
        model$,
        props.maxTime$,
        (state, maxTime) => {
            const remainTime = maxTime - state.timeSpent;
            return {
                time: remainTime < 0 ? 0 : remainTime,
                maxTime
            };
        }
    ).distinctUntilChanged().map(
        ({time, maxTime}): VNode => render({maxTime, time, alertTime: props.alertTime})
    );

    return <Sinks>{
        isActive$: model$.map((state: State): boolean => state.isPlaying),
        timeSpent$: model$.map((state: State): number => state.timeSpent / 1000),
        DOM: vdom$
    }
}
