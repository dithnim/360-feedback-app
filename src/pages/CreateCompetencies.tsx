import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import { useForm, useFieldArray } from "react-hook-form";

interface Question {
  id: string;
  text: string;
  options: string[];
  type: "radio" | "text";
  answer?: string;
}

interface CompetencySection {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface FormData {
  competency: string;
  description: string;
  generalQuestions: Question[];
  sections: CompetencySection[];
}

const CreateCompetencies = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      competency: "",
      description: "",
      generalQuestions: [
        {
          id: "gen-q1",
          text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ?",
          options: [
            "Strongly Agree",
            "Agree",
            "Neutral",
            "Strongly Disagree",
            "Disagree",
          ],
          type: "radio",
        },
      ],
      sections: [
        {
          id: "section-leadership",
          title: "Leadership",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo",
          questions: [
            {
              id: "lead-q1",
              text: "1. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo?",
              options: [
                "Strongly Agree",
                "Agree",
                "Neutral",
                "Strongly Disagree",
                "Disagree",
              ],
              type: "radio",
            },
            {
              id: "lead-q2",
              text: "2. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo?",
              options: [
                "Strongly Agree",
                "Agree",
                "Neutral",
                "Strongly Disagree",
                "Disagree",
              ],
              type: "radio",
            },
          ],
        },
        {
          id: "section-communication",
          title: "Communication",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo",
          questions: [
            {
              id: "comm-q1",
              text: "1. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo?",
              options: [
                "Strongly Agree",
                "Agree",
                "Neutral",
                "Strongly Disagree",
                "Disagree",
              ],
              type: "radio",
            },
            {
              id: "comm-q2",
              text: "2. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo?",
              options: [
                "Strongly Agree",
                "Agree",
                "Neutral",
                "Strongly Disagree",
                "Disagree",
              ],
              type: "radio",
            },
            {
              id: "comm-q3",
              text: "3. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo?",
              options: [],
              type: "text",
            },
          ],
        },
      ],
    },
  });

  const {
    fields: generalQuestionFields,
    append: appendGeneralQuestion,
    remove: removeGeneralQuestion,
  } = useFieldArray({
    control,
    name: "generalQuestions",
  });

  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const onSubmit = (_data: FormData) => {
    // Handle survey save logic here
  };

  const handleAddGeneralQuestion = () => {
    appendGeneralQuestion({
      id: `gen-q-${generalQuestionFields.length + 1}`,
      text: "",
      options: [
        "Strongly Agree",
        "Agree",
        "Neutral",
        "Strongly Disagree",
        "Disagree",
      ],
      type: "radio",
    });
  };

  const handleRemoveGeneralQuestion = (index: number) => {
    removeGeneralQuestion(index);
  };

  const addNewSection = () => {
    appendSection({
      id: `section-${sectionFields.length + 1}`,
      title: `New Section ${sectionFields.length + 1}`,
      description: "",
      questions: [],
    });
  };

  const handleRemoveSection = (index: number) => {
    removeSection(index);
  };

  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div className="h-full px-50 pt-10">
        <label
          htmlFor="create from scratch"
          className="text-3xl font-semibold mb-8"
        >
          Create from Scratch
        </label>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
          <div className="mb-5">
            <label
              htmlFor="competency"
              className="block mb-2 text-lg text-gray-500"
            >
              Competency*
            </label>
            <input
              type="text"
              id="competency"
              className={`bg-gray-50 border ${
                errors.competency ? "border-red-500" : "border-gray-300"
              } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold`}
              {...register("competency", {
                required: "Competency is required",
              })}
            />
            {errors.competency && (
              <p className="mt-1 text-sm text-red-500">
                {errors.competency.message}
              </p>
            )}
          </div>

          <div className="mb-5">
            <label
              htmlFor="description"
              className="block mb-2 text-lg text-gray-500"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full font-bold p-2.5"
              rows={4}
              {...register("description")}
            ></textarea>
          </div>

          {/* General Questions Section */}
          <div className="mb-8">
            <label
              htmlFor="questions"
              className="block mb-4 text-lg text-gray-500"
            >
              Questions*
            </label>
            {generalQuestionFields.map((field, index) => (
              <div key={field.id} className="mb-4 p-4 border rounded-md">
                <div className="flex items-center mb-2">
                  <input
                    type="text"
                    className="flex-grow bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2.5 py-3.5 font-bold me-3"
                    placeholder="Enter your question"
                    {...register(`generalQuestions.${index}.text`, {
                      required: "Question text is required",
                    })}
                  />
                  <Button variant="default" className="p-2 me-2">
                    ✏️
                  </Button>
                  <Button
                    variant="default"
                    className="p-2"
                    onClick={() => handleRemoveGeneralQuestion(index)}
                  >
                    ➖
                  </Button>
                </div>
                {field.type === "radio" && (
                  <div className="flex space-x-4">
                    {field.options.map((option) => (
                      <label key={option} className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-5 w-5 text-red-600"
                          value={option}
                          {...register(`generalQuestions.${index}.answer`, {
                            required: "Please select an option",
                          })}
                        />
                        <span className="ml-2 text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
                {errors.generalQuestions?.[index]?.text && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.generalQuestions[index]?.text?.message}
                  </p>
                )}
                {errors.generalQuestions?.[index]?.answer && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.generalQuestions[index]?.answer?.message}
                  </p>
                )}
              </div>
            ))}
            <Button
              variant="save"
              className="mt-4 p-3 text-lg cursor-pointer"
              onClick={handleAddGeneralQuestion}
            >
              Add
            </Button>
          </div>

          {/* Dynamic Competency Sections */}
          {sectionFields.map((section, sectionIndex) => (
            <div
              key={section.id}
              className="mt-8 p-6 border rounded-lg shadow-md bg-white"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{section.title}</h3>
                <Button
                  variant="default"
                  className="p-2"
                  onClick={() => handleRemoveSection(sectionIndex)}
                >
                  🗑️
                </Button>
              </div>
              {section.description && (
                <p className="text-gray-600 mb-4">{section.description}</p>
              )}

              {/* Questions within this section */}
              {section.questions.map((question, questionIndex) => (
                <div key={question.id} className="mb-4 p-4 border rounded-md">
                  <label className="block text-gray-700 text-lg mb-2">
                    {question.text}
                  </label>
                  {question.type === "radio" && (
                    <div className="flex space-x-4">
                      {question.options.map((option) => (
                        <label
                          key={option}
                          className="inline-flex items-center"
                        >
                          <input
                            type="radio"
                            className="form-radio h-5 w-5 text-red-600"
                            value={option}
                            {...register(
                              `sections.${sectionIndex}.questions.${questionIndex}.answer`,
                              { required: true }
                            )}
                          />
                          <span className="ml-2 text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {question.type === "text" && (
                    <input
                      type="text"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold"
                      {...register(
                        `sections.${sectionIndex}.questions.${questionIndex}.answer`,
                        { required: "Answer is required" }
                      )}
                    />
                  )}
                </div>
              ))}
              <Button
                variant="next"
                className="mt-4 p-3 text-lg cursor-pointer"
              >
                Next
              </Button>
            </div>
          ))}

          <Button
            variant="default"
            className="mt-8 p-3 text-lg cursor-pointer"
            onClick={addNewSection}
          >
            + New Section
          </Button>

          <div className="flex justify-end mt-10">
            <Button
              type="submit"
              variant="save"
              className="p-6 text-lg cursor-pointer me-3"
            >
              Save Survey
            </Button>
            <Button variant="previous" className="p-6 text-lg cursor-pointer">
              Preview
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCompetencies;
