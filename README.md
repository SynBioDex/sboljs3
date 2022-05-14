**sboljs3** is a library for the Synthetic Biology Open Language (SBOL) written in TypeScript, for JavaScript/TypeScript applications in the browser or node.js. 

sboljs3 is built on [rdfoo](https://github.com/udp/rdfoo), a library for creating object oriented RDF abstractions in TypeScript.  It can therefore be used in conjunction with other rdfoo abstractions.  For example, the PROV-O abstraction used by sboljs3 is provided by [rdfoo-prov](https://github.com/udp/rdfoo-prov).


# Implemented so far

* Reading and writing SBOL1, SBOL2, and SBOL3
* Converting between SBOL1, SBOL2, and SBOL3
* Reading (converting) FASTA and GenBank


# Not implemented so far

* Writing FASTA and GenBank
* Validation



# Citation

If you use this library in your work, please cite

    @article{sboljs,
      author = {McLaughlin, James Alastair and Myers, Chris J. and Zundel, Zach and Wilkinson, Nathan and Atallah, Christian and Wipat, Anil},
      title = {sboljs: Bringing the Synthetic Biology Open Language to the Web Browser},
      journal = {ACS Synthetic Biology},
      volume = {8},
      number = {1},
      pages = {191-193},
      year = {2019},
      doi = {10.1021/acssynbio.8b00338},
      URL = { https://doi.org/10.1021/acssynbio.8b00338 },
      eprint = {  https://doi.org/10.1021/acssynbio.8b00338 }
    }
    
    
