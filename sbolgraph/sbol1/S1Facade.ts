
import Facade from '../Facade'
import SBOL1Graph from '../SBOL1Graph';

export default abstract class S1Facade extends Facade {

    get graph() {

        return this._graph as SBOL1Graph

    }


}