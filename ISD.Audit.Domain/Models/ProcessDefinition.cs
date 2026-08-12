using System;
using System.Collections.Generic;
using System.Data.SqlTypes;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ISD.Audit.Domain.Models;
 public class ProcessDefinition
 {
    // = default!; الـ ! اسمها null-forgiving operator
    //خاصية نوعها non-nullable (string مو string?) — يعني لازم تكون معبّاة.
   // we use it for the field where they r not Null
   // So that we tell the compailer that we will enter the data
   // to this field not now but from the constructor later  !! 
    public int ProcessId { get; private set; }
    public string ProcessName { get; private set; } = default!;
    public string StepName { get; private set; } = default!;
    public int StepOrder { get; private set; } 
    public bool IsFinalStep { get; private set; } 
    public string? Description { get; private set; }
    public DateTime CreatedAt { get; private set; }


    // An empty constructor, cuz the EF Core needs an empty one to build the Object from the DataBase
    // and return the data when u use the query from the DB !!
    private ProcessDefinition() { }

    //Factory Method to Prevent the user from entering an empty values !!
    //هذا نمط شائع بالـ DDD لحماية الـ invariants (بمعنى منع حد يعمل new Order() وينسى يعبي بيانات أساسية).
    public static ProcessDefinition Create ( 
        string processName ,
        string stepName ,
        int stepOrder ,
        bool isFinalStep  = false,
        string? description = null)
    {
        return new ProcessDefinition
        {
            ProcessName = processName,
            StepName = stepName,
            StepOrder = stepOrder,
            IsFinalStep = isFinalStep,
            Description = description,
            CreatedAt = DateTime.UtcNow
        };
    }
}

