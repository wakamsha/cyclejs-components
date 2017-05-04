import {Observable} from 'rxjs';
import {VNode, div} from '@cycle/dom';
import isolate from '@cycle/isolate';

type Sources = {
    props: {
        transclude$: Observable<VNode>;
        visibility$: Observable<boolean>;
    }
}

type Sinks = {
    DOM: Observable<VNode>;
}

function render(visible: boolean, transclude: VNode): VNode {
    return div('.modal', {
        class: {
            'modal--visible': visible
        }
    }, [
        div('.modal__content', [visible ? transclude : null])
    ]);
}

function Component({props}: Sources): Sinks {
    const view$: Observable<VNode> = Observable.combineLatest(
        props.visibility$.startWith(false),
        props.transclude$,
        (visible, transclude) => render(visible, transclude)
    );

    return {
        DOM: view$
    };
}

export function ModalComponent({props}: Sources): Sinks {
    return isolate(Component)({props});
}
