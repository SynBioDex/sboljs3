
import { Facade, Graph } from 'rdfoo'
import SBOL2Graph from '../SBOL2Graph';
import SBOL2GraphView from '../SBOL2GraphView';

export default abstract class S2Facade extends Facade {

    view:SBOL2GraphView

    constructor(view:SBOL2GraphView, uri:string) {
        super(view.graph, uri)
        this.view = view
    }
}
