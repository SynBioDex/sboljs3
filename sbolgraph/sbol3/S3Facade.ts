

import { Facade } from 'rdfoo'
import SBOL3GraphView from '../SBOL3GraphView';

export default abstract class S3Facade extends Facade {

    view:SBOL3GraphView

    constructor(view:SBOL3GraphView, uri:string) {
        super(view.graph, uri)
        this.view = view
    }


}
