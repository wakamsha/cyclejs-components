import {Observable} from 'rxjs';
import {VNode, div} from '@cycle/dom';

type Sources = {
    // DOM: DOMSource;
    props: {
        transclude$: Observable<VNode>;
        visibility$: Observable<boolean>;
    }
}

function render(visible: boolean, transclude: VNode): VNode {
    return div('.backdrop', {
        class: {
            'backdrop--visible': visible
        }
    }, [
        div('.backdrop__content', [visible ? transclude : null])
    ]);
}

export function BackdropComponent({props}: Sources) {
    const view$: Observable<VNode> = Observable.combineLatest(
        props.visibility$.startWith(false),
        props.transclude$,
        (visible, transclude) => render(visible, transclude)
    );

    return {
        DOM: view$
    };
}
