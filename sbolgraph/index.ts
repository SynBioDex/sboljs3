
import SBOL1GraphView from './SBOL1GraphView'
import SBOL2GraphView from './SBOL2GraphView'
import SBOL3GraphView from './SBOL3GraphView'

import { sbol1 } from './SBOL1GraphView'
import { sbol2 } from './SBOL2GraphView'
import { sbol3 }  from './SBOL3GraphView'

import S1Facade from './sbol1/S1Facade'
import S1Collection from './sbol1/S1Collection'
import S1DnaComponent from './sbol1/S1DnaComponent'
import S1DnaSequence from './sbol1/S1DnaSequence'
import S1SequenceAnnotation from './sbol1/S1SequenceAnnotation'

import S2Identified from './sbol2/S2Identified'
import S2ComponentInstance from './sbol2/S2ComponentInstance'
import S2ModuleInstance from './sbol2/S2ModuleInstance'
import S2ComponentDefinition from './sbol2/S2ComponentDefinition'
import S2ModuleDefinition from './sbol2/S2ModuleDefinition'
import S2SequenceAnnotation from './sbol2/S2SequenceAnnotation'
import S2FunctionalComponent from './sbol2/S2FunctionalComponent'
import S2Implementation from './sbol2/S2Implementation'
import S2Experiment from './sbol2/S2Experiment'
import S2ExperimentalData from './sbol2/S2ExperimentalData'
import S2Sequence from './sbol2/S2Sequence'
import S2Location from './sbol2/S2Location'
import S2OrientedLocation from './sbol2/S2OrientedLocation'
import S2Range from './sbol2/S2Range'
import S2Cut from './sbol2/S2Cut'
import S2GenericLocation from './sbol2/S2GenericLocation'
import S2Collection from './sbol2/S2Collection'
import S2Interaction from './sbol2/S2Interaction'
import S2MapsTo from './sbol2/S2MapsTo'
import S2Attachment from './sbol2/S2Attachment'

import S3Identified from './sbol3/S3Identified'
import S3SubComponent from './sbol3/S3SubComponent'
import S3Component from './sbol3/S3Component'
import S3Sequence from './sbol3/S3Sequence'
import S3Constraint from './sbol3/S3Constraint'
import S3Location from './sbol3/S3Location'
import S3OrientedLocation from './sbol3/S3OrientedLocation'
import S3Range from './sbol3/S3Range'
import S3SequenceFeature from './sbol3/S3SequenceFeature'
import S3Interaction from './sbol3/S3Interaction'
import S3Participation from './sbol3/S3Participation'
import S3Collection from './sbol3/S3Collection'
import S3Feature from './sbol3/S3Feature'
import S3MapsTo from './sbol3/S3ComponentReference'
import S3Model from './sbol3/S3Model'
import S3Experiment from './sbol3/S3Experiment'
import S3ExperimentalData from './sbol3/S3ExperimentalData'

import Repository from './SBOL2Repository'
import { SearchQuery, SearchResult } from './SBOL2Repository'

import { Graph, Watcher, node, triple, serialize, Facade } from 'rdfoo'
import SBOLConverter from './SBOLConverter'

import fastaToSBOL2 from "./conversion/fastaToSBOL2";
import genbankToSBOL2 from "./conversion/genbankToSBOL2";

export {

    // SBOL1
    SBOL1GraphView,
    sbol1,
    S1Facade,
    S1Collection,
    S1DnaComponent,
    S1DnaSequence,
    S1SequenceAnnotation,

    // SBOL2
    SBOL2GraphView,
    sbol2,
    S2Identified,
    S2ComponentInstance,
    S2ModuleInstance,
    S2ComponentDefinition,
    S2ModuleDefinition,
    S2SequenceAnnotation,
    S2FunctionalComponent,
    S2Implementation,
    S2Experiment,
    S2ExperimentalData,
    S2Sequence,
    S2OrientedLocation,
    S2Location,
    S2Range,
    S2Cut,
    S2GenericLocation,
    S2Collection,
    S2Interaction,
    S2MapsTo,
    S2Attachment,

    // SBOL3
    SBOL3GraphView,
    sbol3,
    S3Identified,
    S3SubComponent,
    S3Component,
    S3Sequence,
    S3Location,
    S3Feature,
    S3OrientedLocation,
    S3Range,
    S3Constraint,
    S3SequenceFeature,
    S3Interaction,
    S3Participation,
    S3Collection,
    S3MapsTo,
    S3Model,
    S3Experiment,
    S3ExperimentalData,

    // etc
    Graph,
    Watcher,
    node,
    triple,
    Repository,
    SearchQuery,
    SearchResult,
    serialize,
    Facade,
    SBOLConverter,
    fastaToSBOL2,
    genbankToSBOL2
}


