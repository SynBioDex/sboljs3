

import { Facade } from 'rdfoo'
import SBOLXGraphView from '../SBOLXGraphView';

export default abstract class SXFacade extends Facade {

    view:SBOLXGraphView

    constructor(view:SBOLXGraphView, uri:string) {
        super(view.graph, uri)
        this.view = view
    }


}
