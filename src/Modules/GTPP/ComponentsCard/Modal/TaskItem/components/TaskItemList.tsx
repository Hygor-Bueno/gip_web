import React from 'react';
import { InputCheckbox } from '../../../../../../Components/CustomForm';
import { Image } from 'react-bootstrap';
import { convertImage } from '../../../../../../Util/Util';
import imageUser from "../../../../../../Assets/Image/user.png";
import ButtonIcon from '../../../Button/ButtonIcon/btnicon';
import ModalInformation from './InformationModal';
import AnexoImage from "../../../../../../Components/Attachment/AttachmentFile";
import { ITaskItemList } from '../Contract/Contract';
import { includeAuthorInList } from '../utils/utilsTaskItem';

const TaskItemList: React.FC<ITaskItemList> = ({ taskDetails,  users,  isMissing,  getUser,  updateCommentCount,  userState,  closeObservation,  subTask,  positionTaskStates,  changePositionItem,  updatePositionTaskItem, checkedItem, togglePositionTask, setOnScrollDown, onScrollDown, userLog, setUserState, updatedAddUserTaskItem, showChat, setEditTask, setOnEditTask, setShowChat, setTaskToDelete, setIsTrashDelete, updateItemTaskFile, props }) => {
    return (
        <React.Fragment>
            {(taskDetails.data?.task_item || []).map((taskItem: any, index: number) => {
                const list = users?.find((item: { user_id: number }) => item?.user_id == taskItem?.created_by);
                const creator = !isMissing(list?.name) ? list?.name : getUser?.name;
                const assignedUser = includeAuthorInList(props.details.data?.task_user, getUser)?.find(
                    (user: any) => user.user_id === taskItem.assigned_to
                );

                if (taskItem.id && taskItem.total_comment === undefined) {
                    updateCommentCount(Number(taskItem.id));
                }

                const total = Number(taskItem.total_comment) || 0;

                return (
                    <div key={taskItem.id} className={`d-flex justify-content-between align-items-center mb-1 bg-light border w-100 p-1 rounded overflow-auto ${userState.loadingList.listTask?.id == taskItem.id ? 'border-mark' : ''}`}>
                    {(subTask.openDialog && subTask.idSubTask === taskItem.id && taskItem.note) && <ModalInformation onClose={closeObservation} task description={taskItem.note} />}
                    {(taskItem.id && positionTaskStates[taskItem.id]) &&
                        <div>
                        <button onClick={async () => {
                            changePositionItem(false, taskItem.id || 0);
                            taskItem.id && await updatePositionTaskItem({ id: taskItem.id, next_or_previous: "previous" });
                        }} title="Subir uma posiçaõ" className="btn py-1 px-3 my-1 btn-outline-success fa-solid fa-arrow-up-long"></button>
                        <button onClick={async () => {
                            changePositionItem(true, taskItem.id || 0);
                            taskItem.id && await updatePositionTaskItem({ id: taskItem.id, next_or_previous: "next" });
                        }} title="Descer uma posição" className="btn py-1 px-3 my-1 btn-outline-danger fa-solid fa-arrow-down-long"></button>
                        </div>
                    }
                    <div className="container-fluid">
                        <div className="row align-items-center mb-2">
                        <div className="col-md-10 col-sm-9">
                            <div className="text-wrap text-break">
                            <InputCheckbox
                                label={taskItem.description}
                                task={taskItem}
                                onChange={checkedItem}
                                onPosition={() => {
                                togglePositionTask(taskItem.id || 0);
                                setOnScrollDown(!onScrollDown);
                                }}
                                yesNo={taskItem.yes_no || 0}
                                checked={taskItem.check || false}
                                key={index}
                                id={(taskItem.id || "0").toString()}
                                order={taskItem.order || 0}
                            />
                            </div>
                        </div>
                        <div className="col-md-2 col-sm-3 text-center">
                            <div className="mx-auto cursor-pointer userPhotoAnimation border-warning"
                            onClick={async () => {
                                // Adicionado getUser?.id no lugar de getUser.id para evitar quebra no click
                                if (userLog.administrator == 1 || getUser?.id == userLog.id) {
                                setUserState((prev: any) => ({
                                    ...prev,
                                    loadingList: {
                                    users: props.details.data?.task_user,
                                    listTask: taskItem
                                    },
                                    isListUser: true,
                                    listUserBtn: { isGetTaskOrIncludeColaborator: false }
                                }));
                                } else {
                                const payload: any = {
                                    id: taskItem.id,
                                    task_id: taskItem.task_id,
                                    user_id: taskItem.assigned_to == 0 ? userLog.id : taskItem.assigned_to
                                }
                                await updatedAddUserTaskItem(payload, setUserState);
                                }
                            }}
                            >
                            {Number(taskItem?.assigned_to) > 0 && assignedUser ? (
                                <Image
                                    title={assignedUser.name}
                                    src={convertImage(assignedUser.photo) || imageUser}
                                    alt={`Foto de ${assignedUser.name}`}
                                    className="rounded-circle"
                                    style={{ width: "30px", height: "30px", objectFit: "cover" }}
                                />
                            ) : (
                                <i className="fa my-2 fa-plus text-secondary"></i>
                            )}
                            </div>
                        </div>
                        </div>

                        <div className="row justify-content-between align-items-center">
                        <div className="col-sm-6">
                            <div>
                            <i>
                                <small className="text-secondary">
                                Por: {taskItem.created_by ? creator : getUser?.name}
                                </small>
                            </i>
                            </div>
                            <React.Fragment>
                                <i 
                                style={{
                                    pointerEvents: showChat ? 'none' : 'auto',
                                    cursor: showChat ? 'not-allowed' : 'pointer',
                                    filter: showChat ? 'grayscale(100%)' : 'none',
                                }}
                                className={`rounded ${showChat ? 'text-secondary' : 'text-primary'} fa-sm fa-solid fa-share animate__animated animate__fadeIn comment_i`}
                                title={showChat ? "Feche o chat aberto para selecionar outro" : "Visualizar comentários"}
                                onClick={() => {
                                    if (!showChat) {
                                    setEditTask(taskItem);
                                    setShowChat(true);
                                    }
                                }}
                                >
                                <small className=""> {total > 0 ? `${total} Comentários` : 'Fazer comentario' }</small>
                                </i>
                            </React.Fragment>
                        </div>
                        <div className="col-sm-6 d-flex justify-content-end gap-2">
                            {taskItem.note && (
                            <ButtonIcon
                                title="Visualizar observação"
                                color="primary"
                                icon="circle-info"
                                description=""
                                onClick={() => closeObservation(taskItem)}
                            />
                            )}
                            <ButtonIcon
                            title="Observação"
                            color="primary"
                            icon="pencil"
                            description=""
                            onClick={() => {
                                setEditTask(taskItem);
                                setOnEditTask(true);
                            }}
                            />

                            <ButtonIcon
                            title="Remover"
                            color="danger"
                            icon="trash"
                            description=""
                            onClick={() => {
                                setTaskToDelete(taskItem);
                                setIsTrashDelete(true);
                            }}
                            />

                            <AnexoImage
                                item_id={taskItem.id || 0}
                                file={taskItem.file || 0}
                                updateAttachmentFile={updateItemTaskFile}
                            />
                        </div>
                        </div>
                    </div>
                    </div>
                )
                })}
        </React.Fragment>
    )
}

export default TaskItemList;