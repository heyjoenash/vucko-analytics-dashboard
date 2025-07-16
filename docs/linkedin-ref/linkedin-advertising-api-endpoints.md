/rest/adAccounts	FINDER
search	rw_ads, r_ads	Member (3-legged)
/rest/adAccounts	CREATE	rw_ads	Member (3-legged)
/rest/adAccounts	BATCH_CREATE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}	DELETE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}	GET	rw_ads, r_ads	Member (3-legged)
/rest/adAccounts/{id}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}/adCampaignGroups	CREATE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}/adCampaignGroups	BATCH_DELETE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}/adCampaignGroups	FINDER
search	rw_ads, r_ads	Member (3-legged)
/rest/adAccounts/{id}/adCampaignGroups	BATCH_CREATE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}/adCampaignGroups	BATCH_PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}/adCampaignGroups	BATCH_GET	rw_ads, r_ads	Member (3-legged)
/rest/adAccounts/{id}/adCampaignGroups/{campaignGroupId}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}/adCampaignGroups/{campaignGroupId}	GET	rw_ads, r_ads	Member (3-legged)
/rest/adAccounts/{id}/adCampaignGroups/{campaignGroupId}	DELETE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}/adCampaigns	BATCH_DELETE	rw_ads	Member (3-legged)
Product API endpoints
Resource	Method	OAuth Scopes	Permission Types
			
/rest/adAccounts/{id}/adCampaigns	CREATE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}/adCampaigns	BATCH_PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}/adCampaigns	BATCH_CREATE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}/adCampaigns	BATCH_GET	rw_ads, r_ads	Member (3-legged)
/rest/adAccounts/{id}/adCampaigns	FINDER
search	rw_ads, r_ads	Member (3-legged)
/rest/adAccounts/{id}/adCampaigns/{campaignId}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}/adCampaigns/{campaignId}	GET	rw_ads, r_ads	Member (3-legged)
/rest/adAccounts/{id}/adCampaigns/{campaignId}	DELETE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}/creatives	BATCH_PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}/creatives	ACTION
createInline	rw_ads	Member (3-legged)
/rest/adAccounts/{id}/creatives	BATCH_DELETE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}/creatives	FINDER
criteria	rw_ads, r_ads	Member (3-legged)
/rest/adAccounts/{id}/creatives	BATCH_GET	rw_ads, r_ads	Member (3-legged)
/rest/adAccounts/{id}/creatives	BATCH_CREATE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}/creatives	CREATE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}/creatives/{creativeId}	DELETE	rw_ads	Member (3-legged)
/rest/adAccounts/{id}/creatives/{creativeId}	GET	rw_ads, r_ads	Member (3-legged)
/rest/adAccounts/{id}/creatives/{creativeId}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/adAccountUsers	FINDER
authenticatedUser	rw_ads, r_ads	Member (3-legged)
/rest/adAccountUsers	FINDER
accounts	rw_ads, r_ads	Member (3-legged)
/rest/adAccountUsers/{key}	UPDATE	rw_ads	Member (3-legged)
/rest/adAccountUsers/{key}	DELETE	rw_ads	Member (3-legged)
/rest/adAccountUsers/{key}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/adAccountUsers/{key}	GET	rw_ads, r_ads	Member (3-legged)
/rest/adAnalytics	FINDER
attributedRevenueMetrics	r_ads_reporting	Member (3-legged)
/rest/adAnalytics	FINDER
analytics	r_ads_reporting	Member (3-legged)
/rest/adAnalytics	FINDER
statistics	r_ads_reporting	Member (3-legged)
/rest/adBudgetPricing	FINDER
criteriaV2	rw_ads, r_ads	Member (3-legged)
/rest/adCampaignGroups	BATCH_CREATE	rw_ads	Member (3-legged)
/rest/adCampaignGroups	BATCH_PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/adCampaignGroups	FINDER
search	rw_ads, r_ads	Member (3-legged)
/rest/adCampaignGroups	BATCH_GET	rw_ads, r_ads	Member (3-legged)
/rest/adCampaignGroups	BATCH_DELETE	rw_ads	Member (3-legged)
/rest/adCampaignGroups	CREATE	rw_ads	Member (3-legged)
/rest/adCampaignGroups/{campaignGroupId}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/adCampaignGroups/{campaignGroupId}	GET	rw_ads, r_ads	Member (3-legged)
/rest/adCampaignGroups/{campaignGroupId}	DELETE	rw_ads	Member (3-legged)
/rest/adCampaigns	BATCH_PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/adCampaigns	BATCH_GET	rw_ads, r_ads	Member (3-legged)
/rest/adCampaigns	BATCH_CREATE	rw_ads	Member (3-legged)
/rest/adCampaigns	CREATE	rw_ads	Member (3-legged)
/rest/adCampaigns	BATCH_DELETE	rw_ads	Member (3-legged)
/rest/adCampaigns	FINDER
search	rw_ads, r_ads	Member (3-legged)
/rest/adCampaigns/{id}	GET	rw_ads, r_ads	Member (3-legged)
/rest/adCampaigns/{id}	DELETE	rw_ads	Member (3-legged)
/rest/adCampaigns/{id}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/adEventWithConversions	FINDER
accountWithOrderId	rw_ads, r_ads	Member (3-legged)
/rest/adExperimentResults	FINDER
searchByCriteria	rw_ads, r_ads	Member (3-legged)

/rest/adExperimentResults/{adExperimentId}	GET	rw_ads, r_ads	Member (3-legged)
/rest/adExperiments	CREATE	rw_ads	Member (3-legged)
/rest/adExperiments	ACTION
validateExperimentSetup	rw_ads	Member (3-legged)
/rest/adExperiments	FINDER
search	rw_ads	Member (3-legged)
/rest/adExperiments	BATCH_GET	rw_ads, r_ads	Member (3-legged)
/rest/adExperiments/{id}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/adExperiments/{id}	DELETE	rw_ads	Member (3-legged)
/rest/adExperiments/{id}	GET	rw_ads, r_ads	Member (3-legged)
/rest/adInMailCompanySenderPermissions/{adInMailCompanySenderPermissionsId}	FINDER
account	rw_ads	Member (3-legged)
/rest/adInMailCompanySenderPermissions/{id}	FINDER
account	rw_ads, r_ads	Member (3-legged)
/rest/adInMailMemberSenderPermissions/{id}	FINDER
member	rw_ads, r_ads	Member (3-legged)
/rest/adInMailMemberSenderPermissions/{id}	UPDATE	rw_ads, r_ads	Member (3-legged)
/rest/adInMailMemberSenderPermissions/{id}	FINDER
account	rw_ads, r_ads	Member (3-legged)
/rest/adInMailMemberSenderPermissionsExternal/{id}	UPDATE	rw_ads	Member (3-legged)
/rest/adInMailMemberSenderPermissionsExternal/{id}	FINDER
account	rw_ads, r_ads	Member (3-legged)
/rest/adInMailMemberSenderPermissionsExternal/{id}	FINDER
member	rw_ads, r_ads	Member (3-legged)


/rest/adLiftTest	CREATE	rw_ads	Member (3-legged)
/rest/adLiftTestBenchmark	FINDER
adLiftTest	rw_ads, r_ads	Member (3-legged)
/rest/adLiftTestResults	FINDER
adLiftTests	rw_ads, r_ads	Member (3-legged)
/rest/adLiftTests	FINDER
criteria	rw_ads, r_ads	Member (3-legged)
/rest/adLiftTests	ACTION
validateAdLiftTest	rw_ads, r_ads	Member (3-legged)
/rest/adLiftTests	ACTION
requiredLiftTestBudgetForKeyMetrics	rw_ads, r_ads	Member (3-legged)
/rest/adLiftTests/{id}	GET	rw_ads, r_ads	Member (3-legged)
/rest/adLiftTests/{id}	DELETE	rw_ads	Member (3-legged)
/rest/adLiftTests/{id}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/adLiftTests/{id}/adLiftTestSurveys	FINDER
criteria	rw_ads, r_ads	Member (3-legged)
/rest/adLiftTests/{id}/adLiftTestSurveys	BATCH_DELETE	rw_ads	Member (3-legged)
/rest/adLiftTests/{id}/adLiftTestSurveys	GET_ALL	rw_ads, r_ads	Member (3-legged)
/rest/adLiftTests/{id}/adLiftTestSurveys	BATCH_CREATE	rw_ads	Member (3-legged)
/rest/adPageSets	CREATE	rw_ads	Member (3-legged)
/rest/adPageSets	FINDER
account	rw_ads, r_ads	Member (3-legged)
/rest/adPageSets/{id}	PARTIAL_UPDATE	rw_ads	Member (3-legged)

/rest/adPageSets/{id}	GET	rw_ads, r_ads	Member (3-legged)
/rest/adPreviews	ACTION
livePreviewForCreative	rw_ads, r_ads	Member (3-legged)
/rest/adPreviews	ACTION
livePreviewForCreativeInline	rw_ads, r_ads	Member (3-legged)
/rest/adPreviews	FINDER
creative	rw_ads, r_ads	Member (3-legged)
/rest/adPublisherRestrictions	ACTION
generateRestrictionsDownloadUrl	rw_ads, r_ads	Member (3-legged)
/rest/adPublisherRestrictions	FINDER
entity	rw_ads, r_ads	Member (3-legged)
/rest/adPublisherRestrictions	ACTION
generateRestrictionsUploadUrl	rw_ads, r_ads	Member (3-legged)
/rest/adPublisherRestrictions	ACTION
generatePublisherListDownloadUrl	rw_ads, r_ads	Member (3-legged)
/rest/adPublisherRestrictions	CREATE	rw_ads	Member (3-legged)
/rest/adPublisherRestrictions/{id}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/adPublisherRestrictions/{id}	GET	rw_ads, r_ads	Member (3-legged)
/rest/adSegments	FINDER
accounts	rw_ads, r_ads	Member (3-legged)
/rest/adSegments	CREATE	rw_ads	Member (3-legged)
/rest/adSegments/{id}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/adSegments/{id}	GET	rw_ads, r_ads	Member (3-legged)
/rest/adSegmentSources	FINDER
sources	rw_ads, r_ads	Member (3-legged)

/rest/adSegmentSources	FINDER
account	rw_ads, r_ads	Member (3-legged)
/rest/adSegmentSources	FINDER
segments	rw_ads, r_ads	Member (3-legged)
/rest/adSegmentSources/{adSegmentSourcesId}	GET	rw_ads, r_ads	Member (3-legged)
/rest/adSegmentSources/{adSegmentSourcesId}	UPDATE	rw_ads	Member (3-legged)
/rest/adSegmentSources/{adSegmentSourcesId}	DELETE	rw_ads	Member (3-legged)
/rest/adSegmentSources/{id}	GET	rw_ads, r_ads	Member (3-legged)
/rest/adSegmentSources/{id}	UPDATE	rw_ads	Member (3-legged)
/rest/adSegmentSources/{id}	DELETE	rw_ads	Member (3-legged)
/rest/adSupplyForecasts	FINDER
criteriaV2	rw_ads, r_ads	Member (3-legged)
/rest/adTargetingEntities	FINDER
similarEntities	-	Application (3-legged)
/rest/adTargetingEntities	FINDER
adTargetingFacet	-	Application (3-legged)
/rest/adTargetingEntities	FINDER
typeahead	-	Application (3-legged)
/rest/adTargetingEntities	FINDER
urns	-	Application (3-legged)
/rest/adTargetingFacets	GET_ALL	-	Application (3-legged)
/rest/adTargetTemplates	BATCH_DELETE	rw_ads	Member (3-legged)
/rest/adTargetTemplates	CREATE	rw_ads	Member (3-legged)

/rest/adTargetTemplates	FINDER
account	rw_ads, r_ads	Member (3-legged)
/rest/adTargetTemplates/{id}	GET	rw_ads, r_ads	Member (3-legged)
/rest/adTargetTemplates/{id}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/adTargetTemplates/{id}	DELETE	rw_ads	Member (3-legged)
/rest/adTrackingParameters/{adEntityKey}	GET	rw_ads, r_ads	Member (3-legged)
/rest/adTrackingParameters/{adEntityKey}	UPDATE	rw_ads	Member (3-legged)
/rest/adTrackingParameters/{adEntityKey}	DELETE	rw_ads	Member (3-legged)
/rest/assets	ACTION
registerLiveEvent	w_organization_social	Member (3-legged)
/rest/assets	ACTION
completeMultipartUpload	w_organization_social	Member (3-legged)
/rest/assets	ACTION
endLiveEvent	w_organization_social	Member (3-legged)
/rest/assets	ACTION
registerUpload	w_organization_social	Member (3-legged)
/rest/assets/{assetId}	GET	w_organization_social	Member (3-legged)
/rest/audienceCounts	FINDER
targetingCriteriaV2	-	Application (3-legged)
/rest/audienceCounts	FINDER
targetingCriteria	-	Application (3-legged)
/rest/brandPageStatistics	FINDER
brand	r_organization_admin, rw_organization_admin	Member (3-legged)
/rest/brandsLookup	BATCH_GET	r_organization_admin	Member (3-legged)


/rest/campaignConversions	BATCH_DELETE	rw_ads	Member (3-legged)
/rest/campaignConversions	BATCH_UPDATE	rw_ads	Member (3-legged)
/rest/campaignConversions	BATCH_GET	rw_ads	Member (3-legged)
/rest/campaignConversions	FINDER
campaigns	rw_ads	Member (3-legged)
/rest/campaignConversions/{campaignConversionsId}	GET	rw_ads, r_ads	Member (3-legged)
/rest/campaignConversions/{campaignConversionsId}	UPDATE	rw_ads	Member (3-legged)
/rest/campaignConversions/{campaignConversionsId}	DELETE	rw_ads	Member (3-legged)
/rest/campaignConversions/{id}	UPDATE	rw_ads	Member (3-legged)
/rest/campaignConversions/{id}	GET	rw_ads, r_ads	Member (3-legged)
/rest/connections/{id}	GET	r_1st_connections_size	Member (3-legged)
/rest/conversationAds	CREATE	rw_ads	Member (3-legged)
/rest/conversationAds	BATCH_GET	rw_ads, r_ads	Member (3-legged)
/rest/conversationAds/{conversationId}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/conversationAds/{conversationId}	GET	rw_ads, r_ads	Member (3-legged)
/rest/conversationAds/{conversationId}/sponsoredMessageContents	GET_ALL	rw_ads, r_ads	Member (3-legged)
/rest/conversationAds/{conversationId}/sponsoredMessageContents	BATCH_PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/conversationAds/{conversationId}/sponsoredMessageContents	BATCH_CREATE	rw_ads	Member (3-legged)
/rest/conversationAds/{conversationId}/sponsoredMessageContents	BATCH_DELETE	rw_ads	Member (3-legged)
/rest/conversationAds/{conversationId}/sponsoredMessageContents	CREATE	rw_ads	Member (3-legged)
/rest/conversationAds/{conversationId}/sponsoredMessageContents/{sponsoredMessageContentId}	GET	rw_ads, r_ads	Member (3-legged)
/rest/conversationAds/{conversationId}/sponsoredMessageContents/{sponsoredMessageContentId}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/conversions	BATCH_CREATE	rw_ads	Member (3-legged)
/rest/conversions	FINDER
campaign	rw_ads, r_ads	Member (3-legged)
/rest/conversions	BATCH_GET	rw_ads, r_ads	Member (3-legged)
/rest/conversions	FINDER
account	rw_ads, r_ads	Member (3-legged)
/rest/conversions	BATCH_PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/conversions/{id}	GET	rw_ads, r_ads	Member (3-legged)
/rest/conversions/{id}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/creatives	BATCH_DELETE	rw_ads	Member (3-legged)
/rest/creatives	FINDER
criteria	rw_ads, r_ads	Member (3-legged)
/rest/creatives	CREATE	rw_ads	Member (3-legged)
/rest/creatives	BATCH_PARTIAL_UPDATE	rw_ads	Member (3-legged)


/rest/creatives	BATCH_CREATE	rw_ads	Member (3-legged)
/rest/creatives	BATCH_GET	rw_ads, r_ads	Member (3-legged)
/rest/creatives	ACTION
createInline	rw_ads	Member (3-legged)
/rest/creatives/{creativeId}	GET	rw_ads, r_ads	Member (3-legged)
/rest/creatives/{creativeId}	DELETE	rw_ads	Member (3-legged)
/rest/creatives/{creativeId}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/degrees	GET_ALL	-	Application (3-legged)
/rest/degrees	BATCH_GET	-	Application (3-legged)
/rest/degrees/{id}	GET	-	Application (3-legged)
/rest/dmpEngagementSourceTypes	GET_ALL	rw_ads, r_ads	Member (3-legged)
/rest/dmpEngagementSourceTypes/{engagementSourceType}	GET	rw_ads, r_ads	Member (3-legged)
/rest/dmpEngagementSourceTypes/{engagementSourceType}/dmpEngagementTriggers	GET_ALL	rw_ads, r_ads	Member (3-legged)
/rest/dmpEngagementSourceTypes/{engagementSourceType}/dmpEngagementTriggers/{engagementTrigger}	GET	rw_ads, r_ads	Member (3-legged)
/rest/dmpSegments	FINDER
publicSegments	rw_ads	Member (3-legged)
/rest/dmpSegments	FINDER
account	rw_ads	Member (3-legged)
/rest/dmpSegments	ACTION
generateUploadUrl	rw_ads	Member (3-legged)



/rest/dmpSegments	CREATE	rw_ads	Member (3-legged)
/rest/dmpSegments	BATCH_DELETE	rw_ads	Member (3-legged)
/rest/dmpSegments	BATCH_GET	rw_ads	Member (3-legged)
/rest/dmpSegments/{dmpSegmentId}	GET	rw_ads	Member (3-legged)
/rest/dmpSegments/{dmpSegmentId}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/dmpSegments/{dmpSegmentId}	DELETE	rw_ads	Member (3-legged)
/rest/dmpSegments/{dmpSegmentId}/destinations	CREATE	rw_ads	Member (3-legged)
/rest/dmpSegments/{dmpSegmentId}/destinations	GET_ALL	rw_ads	Member (3-legged)
/rest/dmpSegments/{dmpSegmentId}/destinations/{destinationName}	GET	rw_ads	Member (3-legged)
/rest/dmpSegments/{dmpSegmentId}/engagementRules	BATCH_DELETE	rw_ads	Member (3-legged)
/rest/dmpSegments/{dmpSegmentId}/engagementRules	CREATE	rw_ads	Member (3-legged)
/rest/dmpSegments/{dmpSegmentId}/engagementRules	GET_ALL	rw_ads, r_ads	Member (3-legged)
/rest/dmpSegments/{dmpSegmentId}/engagementRules	BATCH_CREATE	rw_ads	Member (3-legged)
/rest/dmpSegments/{dmpSegmentId}/engagementRules/{id}	GET	rw_ads, r_ads	Member (3-legged)
/rest/dmpSegments/{dmpSegmentId}/engagementRules/{id}	DELETE	rw_ads	Member (3-legged)
/rest/dmpSegments/{dmpSegmentId}/listUploads	GET_ALL	rw_ads	Member (3-legged)



/rest/dmpSegments/{dmpSegmentId}/listUploads	CREATE	rw_ads	Member (3-legged)
/rest/dmpSegments/{dmpSegmentId}/listUploads/{id}	DELETE	rw_ads	Member (3-legged)
/rest/dmpSegments/{dmpSegmentId}/listUploads/{id}	GET	rw_ads	Member (3-legged)
/rest/documents	ACTION
initializeUpload	w_organization_social, rw_ads, r_organization_social, w_member_social	Member (3-legged)
/rest/documents	FINDER
associatedAccount	w_organization_social, rw_ads, r_organization_social, w_member_social	Member (3-legged)
/rest/documents	BATCH_GET	w_organization_social, rw_ads, r_organization_social, w_member_social	Member (3-legged)
/rest/documents/{documentId}	GET	w_organization_social, rw_ads, r_organization_social, w_member_social	Member (3-legged)
/rest/events	FINDER
eventsByOrganizer	r_organization_admin, rw_organization_admin	Member (3-legged)
/rest/events/{id}	GET	r_organization_admin, rw_organization_admin	Member (3-legged)
/rest/eventSubscriptions	FINDER
subscriberAndEventType	r_organization_admin, rw_organization_admin	Member (3-legged)
/rest/eventSubscriptions/{key}	DELETE	rw_organization_admin	Member (3-legged)
/rest/eventSubscriptions/{key}	GET	r_organization_admin, rw_organization_admin	Member (3-legged)
/rest/eventSubscriptions/{key}	UPDATE	rw_organization_admin	Member (3-legged)
/rest/fieldsOfStudy	BATCH_GET	-	Application (3-legged)
/rest/fieldsOfStudy	GET_ALL	-	Application (3-legged)
/rest/fieldsOfStudy/{id}	GET	-	Application (3-legged)

/rest/functions	GET_ALL	-	Application (3-legged)
/rest/functions/{id}	GET	-	Application (3-legged)
/rest/geo	BATCH_GET	-	Application (3-legged)
/rest/geo/{id}	GET	-	Application (3-legged)
/rest/geoTypeahead	FINDER
search	-	Application (3-legged)
/rest/globalPublisherList	ACTION
generatePublisherListDownloadUrl	rw_ads	Member (3-legged)
/rest/iabCategories	GET_ALL	-	Application (3-legged)
/rest/iabCategory/{id}	GET	-	Application (3-legged)
/rest/images	BATCH_GET	w_organization_social, r_organization_social, w_member_social	Member (3-legged)
/rest/images	FINDER
associatedAccount	w_organization_social, rw_ads	Member (3-legged)
/rest/images	ACTION
initializeUpload	w_organization_social, rw_ads, w_member_social	Member (3-legged)
/rest/images/{imageId}	GET	w_organization_social, r_organization_social, w_member_social	Member (3-legged)
/rest/images/{imageId}	PARTIAL_UPDATE	w_organization_social, rw_ads, w_member_social	Member (3-legged)
/rest/industries	BATCH_GET	r_basicprofile	Member (3-legged)

Application (3-legged)
/rest/industries	GET_ALL	r_basicprofile	Application (3-legged)

Member (3-legged)
/rest/industries/{id}	GET	r_basicprofile	Application (3-legged)

Member (3-legged)

/rest/industryTaxonomyVersions/{version}/industries	GET_ALL	r_basicprofile	Member (3-legged)

Application (3-legged)
/rest/industryTaxonomyVersions/{version}/industries	BATCH_GET	r_basicprofile	Member (3-legged)

Application (3-legged)
/rest/industryTaxonomyVersions/{version}/industries/{id}	GET	r_basicprofile	Member (3-legged)

Application (3-legged)
/rest/inMailContents	ACTION
sendTestInMail	rw_ads	Member (3-legged)
/rest/inMailContents	BATCH_GET	rw_ads, r_ads	Member (3-legged)
/rest/inMailContents	CREATE	rw_ads	Member (3-legged)
/rest/inMailContents/{adInMailContentId}	GET	rw_ads, r_ads	Member (3-legged)
/rest/inMailContents/{adInMailContentId}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/insightTagDomains	FINDER
account	rw_ads, r_ads	Member (3-legged)
/rest/insightTagDomains	BATCH_GET	rw_ads, r_ads	Member (3-legged)
/rest/insightTagDomains	BATCH_PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/insightTagDomains/{id}	GET	rw_ads, r_ads	Member (3-legged)
/rest/insightTagDomains/{id}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/insightTagDomains/{insightTagDomainsId}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/insightTags	FINDER
account	rw_ads, r_ads	Member (3-legged)
/rest/insightTags	CREATE	rw_ads	Member (3-legged)

/rest/insightTags/{id}	GET	rw_ads	Member (3-legged)
/rest/insightTags/{id}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/insightTagsPermission	FINDER
account	rw_ads, r_ads	Member (3-legged)
/rest/insightTagsPermission	ACTION
grantAccess	rw_ads	Member (3-legged)
/rest/insightTagsPermission	ACTION
revokeAccess	rw_ads	Member (3-legged)
/rest/leadForms	CREATE	rw_ads	Member (3-legged)
/rest/leadForms	BATCH_GET	rw_ads, r_ads	Member (3-legged)
/rest/leadForms	FINDER
owner	rw_ads, r_ads	Member (3-legged)
/rest/leadForms/{id}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/leadForms/{id}	GET	rw_ads, r_ads	Member (3-legged)
/rest/me	GET	r_basicprofile	Member (3-legged)
/rest/networkSizes/{id}	GET	-	Application (3-legged)
/rest/organizationAcls	FINDER
organization	r_organization_admin, rw_organization_admin	Member (3-legged)
/rest/organizationAcls	FINDER
roleAssignee	r_organization_admin, rw_organization_admin	Member (3-legged)
/rest/organizationAcls/{id}	UPDATE	r_organization_admin, rw_organization_admin	Member (3-legged)
/rest/organizationAcls/{organizationAclsId}	UPDATE	r_organization_admin, rw_organization_admin	Member (3-legged)

cs	FINDER
organizationalEntity	r_organization_admin, rw_organization_admin	Member (3-legged)
/rest/organizationalEntityNotifications	FINDER
criteria	r_organization_admin, rw_organization_admin	Member (3-legged)
/rest/organizationalEntityShareStatistics	FINDER
organizationalEntity	r_organization_admin, rw_organization_admin	Member (3-legged)
/rest/organizationAuthorizations	BATCH_GET	rw_organization_admin	Member (3-legged)
/rest/organizationAuthorizations	BATCH_FINDER
authorizationActionsAndOrganization	rw_organization_admin	Member (3-legged)
/rest/organizationAuthorizations	BATCH_FINDER
authorizationActionsAndImpersonator	rw_organization_admin	Member (3-legged)
/rest/organizationAuthorizations/{id}	GET	rw_organization_admin	Member (3-legged)
/rest/organizationBrands	FINDER
vanityName	r_organization_admin, rw_organization_admin	Application (3-legged)

Member (3-legged)
/rest/organizationBrands	FINDER
parentOrganization	r_organization_admin, rw_organization_admin	Application (3-legged)

Member (3-legged)
/rest/organizationBrands	BATCH_GET	r_organization_admin, rw_organization_admin	Application (3-legged)

Member (3-legged)
/rest/organizationBrands/{id}	GET	r_organization_admin, rw_organization_admin	Application (3-legged)

Member (3-legged)
/rest/organizationPageStatistics	FINDER
organization	r_organization_admin, rw_organization_admin	Member (3-legged)
/rest/organizations	BATCH_GET	r_organization_admin, rw_organization_admin	Application (3-legged)

Member (3-legged)
/rest/organizations	FINDER
parentOrganization	r_organization_admin, rw_organization_admin	Application (3-legged)

Member (3-legged)
/rest/organizations	FINDER
vanityName	r_organization_admin, rw_organization_admin	Application (3-legged)

Member (3-legged)
/rest/organizations/{id}	GET	r_organization_admin, rw_organization_admin	Application (3-legged)

Member (3-legged)

/rest/organizationShareAuthorizations/{id}	GET	rw_ads	Member (3-legged)
/rest/organizationShareAuthorizations/{organizationShareAuthorizationsId}	GET	rw_ads	Member (3-legged)
/rest/organizationsLookup	BATCH_GET	r_organization_admin	Application (3-legged)

Member (3-legged)
/rest/pageMessages	BATCH_GET	r_organization_admin	Application (3-legged)

Member (3-legged)
/rest/pageThreads	BATCH_GET	r_organization_admin	Application (3-legged)

Member (3-legged)
/rest/people	BATCH_GET	-	Application (3-legged)
/rest/people/{memberId}	GET	-	Application (3-legged)
/rest/posts	CREATE	w_organization_social, w_member_social	Member (3-legged)
/rest/posts	FINDER
dscAdAccount	r_organization_social	Member (3-legged)
/rest/posts	BATCH_GET	r_organization_social	Member (3-legged)
/rest/posts	FINDER
author	r_organization_social	Member (3-legged)
/rest/posts/{postUrn}	DELETE	w_organization_social, w_member_social	Member (3-legged)
/rest/posts/{postUrn}	GET	r_organization_social	Member (3-legged)
/rest/posts/{postUrn}	PARTIAL_UPDATE	w_organization_social, w_member_social	Member (3-legged)
/rest/reactions/{id}	DELETE	w_organization_social, r_organization_social, w_member_social	Member (3-legged)
/rest/reactions/{id}	PARTIAL_UPDATE	w_organization_social, r_organization_social, w_member_social	Member (3-legged)
/rest/reactions/{id}	FINDER
entity	w_organization_social, r_organization_social, w_member_social	Member (3-legged)
/rest/seniorities	GET_ALL	-	Application (3-legged)
/rest/seniorities/{id}	GET	-	Application (3-legged)
/rest/skills	BATCH_GET	-	Application (3-legged)
/rest/skills	GET_ALL	-	Application (3-legged)
/rest/skills/{skillId}	GET	-	Application (3-legged)
/rest/socialActions/{target}/comments/{commentId}	PARTIAL_UPDATE	w_organization_social	Member (3-legged)
/rest/standardizedTitles	GET_ALL	-	Application (3-legged)
/rest/standardizedTitles	BATCH_GET	-	Application (3-legged)
/rest/standardizedTitles/{id}	GET	-	Application (3-legged)
/rest/thirdPartyTrackingTags	CREATE	rw_ads	Member (3-legged)
/rest/thirdPartyTrackingTags	FINDER
creative	rw_ads, r_ads	Member (3-legged)
/rest/thirdPartyTrackingTags/{id}	GET	rw_ads, r_ads	Member (3-legged)
/rest/thirdPartyTrackingTags/{id}	PARTIAL_UPDATE	rw_ads	Member (3-legged)
/rest/thirdPartyTrackingTags/{id}	DELETE	rw_ads	Member (3-legged)
/rest/titles	BATCH_GET	-	Application (3-legged)

/rest/titles	GET_ALL	-	Application (3-legged)
/rest/titles/{id}	GET	-	Application (3-legged)
/rest/videoAnalytics	FINDER
entity	r_organization_social	Member (3-legged)
/rest/videos	BATCH_GET	w_organization_social, r_organization_social, w_member_social	Member (3-legged)
/rest/videos	ACTION
initializeUpload	w_organization_social, w_member_social	Member (3-legged)
/rest/videos	ACTION
finalizeUpload	w_organization_social, w_member_social	Member (3-legged)
/rest/videos	FINDER
associatedAccount	w_organization_social, rw_ads	Member (3-legged)
/rest/videos/{videoId}	GET	w_organization_social, r_organization_social, w_member_social	Member (3-legged)
/rest/videos/{videoId}	PARTIAL_UPDATE	w_organization_social, rw_ads, w_member_social	Member (3-legged)













