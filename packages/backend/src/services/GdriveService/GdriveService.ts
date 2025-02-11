import { subject } from '@casl/ability';
import {
    ForbiddenError,
    SessionUser,
    UploadMetricGsheet,
    UploadMetricGsheetPayload,
} from '@lightdash/common';

import { schedulerClient } from '../../clients/clients';
import { LightdashConfig } from '../../config/parseConfig';
import { DashboardModel } from '../../models/DashboardModel/DashboardModel';
import { SavedChartModel } from '../../models/SavedChartModel';
import { UserModel } from '../../models/UserModel';
import { ProjectService } from '../ProjectService/ProjectService';

type GdriveServiceArguments = {
    lightdashConfig: LightdashConfig;
    projectService: ProjectService;
    savedChartModel: SavedChartModel;
    dashboardModel: DashboardModel;
    userModel: UserModel;
};

export class GdriveService {
    lightdashConfig: LightdashConfig;

    projectService: ProjectService;

    savedChartModel: SavedChartModel;

    dashboardModel: DashboardModel;

    userModel: UserModel;

    constructor({
        lightdashConfig,
        userModel,
        projectService,
        savedChartModel,
        dashboardModel,
    }: GdriveServiceArguments) {
        this.lightdashConfig = lightdashConfig;
        this.userModel = userModel;
        this.projectService = projectService;
        this.savedChartModel = savedChartModel;
        this.dashboardModel = dashboardModel;
    }

    static async scheduleUploadGsheet(
        user: SessionUser,
        gsheetOptions: UploadMetricGsheet,
    ) {
        if (
            user.ability.cannot(
                'manage',
                subject('ExportCsv', {
                    organizationUuid: user.organizationUuid,
                    projectUuid: gsheetOptions.projectUuid,
                }),
            )
        ) {
            throw new ForbiddenError();
        }

        const payload: UploadMetricGsheetPayload = {
            ...gsheetOptions,
            userUuid: user.userUuid,
            organizationUuid: user.organizationUuid,
        };
        const { jobId } = await schedulerClient.uploadGsheetFromQueryJob(
            payload,
        );

        return { jobId };
    }
}
