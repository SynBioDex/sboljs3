
import Facade from '../Facade'
import SBOL2Graph from '../SBOL2Graph';

export default abstract class S2Facade extends Facade {

    get graph() {

        return this._graph as SBOL2Graph

    }


}