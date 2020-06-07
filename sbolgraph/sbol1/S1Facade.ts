
import { Facade } from 'rdfoo'
import SBOL1GraphView from '../SBOL1GraphView';

export default abstract class S1Facade extends Facade {

    view:SBOL1GraphView

    constructor(view:SBOL1GraphView, uri:string) {
        super(view.graph, uri)
        this.view = view
    }
    


}
